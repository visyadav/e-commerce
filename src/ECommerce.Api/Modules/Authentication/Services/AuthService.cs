using AutoMapper;
using ECommerce.Api.Modules.Authentication.DTOs;
using ECommerce.Api.Modules.Authentication.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Infrastructure.Identity;
using ECommerce.Shared.Constants;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ECommerce.Api.Modules.Authentication.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IMapper _mapper;
    private readonly IUnitOfWork _unitOfWork;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IJwtTokenService jwtTokenService,
        IMapper mapper,
        IUnitOfWork unitOfWork,
        IOptions<JwtSettings> jwtSettings)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtTokenService = jwtTokenService;
        _mapper = mapper;
        _unitOfWork = unitOfWork;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return ApiResponse<AuthResponse>.FailureResponse("User with this email already exists.", ["Email already in use."]);
        }

        var user = _mapper.Map<ApplicationUser>(request);
        
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return ApiResponse<AuthResponse>.FailureResponse("User registration failed.", errors);
        }

        // Add to default Customer role
        if (!await _roleManager.RoleExistsAsync(AppConstants.Roles.Customer))
        {
            await _roleManager.CreateAsync(new IdentityRole(AppConstants.Roles.Customer));
        }
        await _userManager.AddToRoleAsync(user, AppConstants.Roles.Customer);

        return await GenerateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !user.IsActive)
        {
            return ApiResponse<AuthResponse>.FailureResponse("Invalid credentials or user is inactive.", ["Authentication failed."]);
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            return ApiResponse<AuthResponse>.FailureResponse("Invalid credentials.", ["Authentication failed."]);
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return await GenerateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<ApiResponse<AuthResponse>> RefreshTokenAsync(string accessToken, string refreshToken, CancellationToken cancellationToken = default)
    {
        var principal = _jwtTokenService.GetPrincipalFromExpiredToken(accessToken);
        if (principal == null)
        {
            return ApiResponse<AuthResponse>.FailureResponse("Invalid access token.", ["Authentication failed."]);
        }

        var userId = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return ApiResponse<AuthResponse>.FailureResponse("Invalid token claims.", ["Authentication failed."]);
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null || !user.IsActive)
        {
            return ApiResponse<AuthResponse>.FailureResponse("User not found or inactive.", ["Authentication failed."]);
        }

        var refreshTokenRepo = _unitOfWork.Repository<RefreshToken>();
        var storedTokens = await refreshTokenRepo.FindAsync(r => r.Token == refreshToken && r.UserId == userId, cancellationToken);
        var storedRefreshToken = storedTokens.FirstOrDefault();

        if (storedRefreshToken == null || !storedRefreshToken.IsActive)
        {
            return ApiResponse<AuthResponse>.FailureResponse("Invalid or expired refresh token.", ["Authentication failed."]);
        }

        // Revoke current token
        storedRefreshToken.IsRevoked = true;
        storedRefreshToken.RevokedAt = DateTime.UtcNow;

        // Generate new tokens
        var roles = await _userManager.GetRolesAsync(user);
        var newAccessToken = _jwtTokenService.GenerateAccessToken(user, roles);
        var newRefreshTokenString = _jwtTokenService.GenerateRefreshToken();

        // Save new refresh token
        storedRefreshToken.ReplacedByToken = newRefreshTokenString;
        refreshTokenRepo.Update(storedRefreshToken);

        var newRefreshToken = new RefreshToken
        {
            Token = newRefreshTokenString,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            User = user
        };
        await refreshTokenRepo.AddAsync(newRefreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshTokenString,
            AccessTokenExpiration = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Roles = [.. roles]
        };

        return ApiResponse<AuthResponse>.SuccessResponse(response, "Token refreshed successfully.");
    }

    private async Task<ApiResponse<AuthResponse>> GenerateAuthResponseAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _jwtTokenService.GenerateAccessToken(user, roles);
        var refreshTokenString = _jwtTokenService.GenerateRefreshToken();

        // Save refresh token to database
        var refreshToken = new RefreshToken
        {
            Token = refreshTokenString,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            User = user
        };

        await _unitOfWork.Repository<RefreshToken>().AddAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenString,
            AccessTokenExpiration = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Roles = [.. roles]
        };

        return ApiResponse<AuthResponse>.SuccessResponse(response, "Authentication successful.");
    }
}
