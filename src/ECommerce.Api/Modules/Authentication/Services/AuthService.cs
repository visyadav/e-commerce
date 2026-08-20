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
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IJwtTokenService jwtTokenService,
        IMapper mapper,
        IUnitOfWork unitOfWork,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtTokenService = jwtTokenService;
        _mapper = mapper;
        _unitOfWork = unitOfWork;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation($"Checking User exist or not for this email id {request.Email}");
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            _logger.LogWarning($"User with this email {request.Email} already exists.");
            return ApiResponse<AuthResponse>.FailureResponse("User with this email already exists.", ["Email already in use."]);
        }

        _logger.LogInformation($"Start Mapping for User.");
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
            Roles = [.. roles],
            ThemeColor = user.ThemeColor
        };

        return ApiResponse<AuthResponse>.SuccessResponse(response, "Token refreshed successfully.");
    }

    public async Task<ApiResponse<AuthResponse>> RegisterCustomerAsync(CustomerRegisterRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation($"Checking customer exist or not for phone number {request.PhoneNumber}");
        
        // Check phone number uniqueness
        var existingPhoneUser = await _userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber, cancellationToken);
        if (existingPhoneUser != null)
        {
            _logger.LogWarning($"User with phone number {request.PhoneNumber} already exists.");
            return ApiResponse<AuthResponse>.FailureResponse("User with this phone number already exists.", ["Phone number already in use."]);
        }

        // Check email uniqueness if email provided
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var existingEmailUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingEmailUser != null)
            {
                return ApiResponse<AuthResponse>.FailureResponse("User with this email already exists.", ["Email already in use."]);
            }
        }

        var user = _mapper.Map<ApplicationUser>(request);

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return ApiResponse<AuthResponse>.FailureResponse("Customer registration failed.", errors);
        }

        // Assign default Customer role
        if (!await _roleManager.RoleExistsAsync(AppConstants.Roles.Customer))
        {
            await _roleManager.CreateAsync(new IdentityRole(AppConstants.Roles.Customer));
        }
        await _userManager.AddToRoleAsync(user, AppConstants.Roles.Customer);

        return await GenerateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<ApiResponse<AuthResponse>> LoginCustomerAsync(CustomerLoginRequest request, CancellationToken cancellationToken = default)
    {
        // Find user by Phone Number, Email, or UserName
        var user = await _userManager.Users.FirstOrDefaultAsync(u =>
            u.PhoneNumber == request.Identifier ||
            u.Email == request.Identifier ||
            u.UserName == request.Identifier, cancellationToken);

        if (user == null || !user.IsActive)
        {
            return ApiResponse<AuthResponse>.FailureResponse("Invalid phone/email or password, or user is inactive.", ["Authentication failed."]);
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            return ApiResponse<AuthResponse>.FailureResponse("Invalid phone/email or password.", ["Authentication failed."]);
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return await GenerateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<ApiResponse<AuthResponse>> ExternalLoginAsync(ExternalLoginRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation($"Processing external login for provider: {request.Provider}");

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return ApiResponse<AuthResponse>.FailureResponse("Email is required for social authentication.", ["Invalid payload"]);
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName ?? "Social",
                LastName = request.LastName ?? "User",
                EmailConfirmed = true,
                IsActive = true
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return ApiResponse<AuthResponse>.FailureResponse("Failed to create customer account from social login.", createResult.Errors.Select(e => e.Description).ToList());
            }

            if (!await _roleManager.RoleExistsAsync(AppConstants.Roles.Customer))
            {
                await _roleManager.CreateAsync(new IdentityRole(AppConstants.Roles.Customer));
            }
            await _userManager.AddToRoleAsync(user, AppConstants.Roles.Customer);
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return await GenerateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<ApiResponse<AuthResponse>> GetMeAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null || !user.IsActive)
        {
            return ApiResponse<AuthResponse>.FailureResponse("User not found or inactive.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var response = new AuthResponse
        {
            AccessToken = string.Empty,
            RefreshToken = string.Empty,
            AccessTokenExpiration = DateTime.UtcNow,
            Email = user.Email ?? user.PhoneNumber ?? string.Empty,
            FullName = user.FullName,
            Roles = [.. roles],
            ThemeColor = user.ThemeColor
        };

        return ApiResponse<AuthResponse>.SuccessResponse(response, "User details retrieved.");
    }

    public async Task<ApiResponse> ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return ApiResponse.FailureResponse("User not found.");
        }

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return ApiResponse.FailureResponse("Password change failed.", errors);
        }

        return ApiResponse.SuccessResponse("Password changed successfully.");
    }

    public async Task<ApiResponse<AuthResponse>> LoginWithMobileOtpAsync(MobileOtpLoginRequest request, CancellationToken cancellationToken = default)
    {
        var rawPhone = request.PhoneNumber.Trim();
        var digitsOnly = new string(rawPhone.Where(char.IsDigit).ToArray());
        var cleanPhone = digitsOnly.Length >= 10 ? digitsOnly[^10..] : digitsOnly;

        if (string.IsNullOrWhiteSpace(cleanPhone) || cleanPhone.Length < 10)
        {
            return ApiResponse<AuthResponse>.FailureResponse("Please enter a valid 10-digit mobile number.", ["Invalid phone number"]);
        }

        // Find or create customer user
        var user = await _userManager.Users.FirstOrDefaultAsync(
            u => u.PhoneNumber == cleanPhone || u.PhoneNumber == rawPhone || u.UserName == cleanPhone, 
            cancellationToken);

        if (user == null)
        {
            var name = !string.IsNullOrWhiteSpace(request.FullName) ? request.FullName.Trim() : $"Customer {cleanPhone[^4..]}";
            var uniqueEmail = $"{cleanPhone}@customer.cooksafari.app";

            user = new ApplicationUser
            {
                UserName = cleanPhone,
                PhoneNumber = cleanPhone,
                FirstName = name,
                LastName = name,
                Email = uniqueEmail,
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user, $"Cust#{cleanPhone[^4..]}!2026");
            if (!createResult.Succeeded)
            {
                var errs = createResult.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("Failed to create customer account for phone {PhoneNumber}: {Errors}", cleanPhone, string.Join(", ", errs));
                return ApiResponse<AuthResponse>.FailureResponse("Failed to create customer session.", errs);
            }

            if (!await _roleManager.RoleExistsAsync(AppConstants.Roles.Customer))
            {
                await _roleManager.CreateAsync(new IdentityRole(AppConstants.Roles.Customer));
            }
            await _userManager.AddToRoleAsync(user, AppConstants.Roles.Customer);
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return await GenerateAuthResponseAsync(user, cancellationToken);
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
            Roles = [.. roles],
            ThemeColor = user.ThemeColor
        };

        return ApiResponse<AuthResponse>.SuccessResponse(response, "Authentication successful.");
    }
}
