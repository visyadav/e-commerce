using ECommerce.Api.Modules.Users.DTOs;
using ECommerce.Api.Modules.Users.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Shared.Exceptions;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ECommerce.Infrastructure.Persistence.Context;
using System.Text.Json;

namespace ECommerce.Api.Modules.Users.Services;

public class AdminUserService : IAdminUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _dbContext;

    public AdminUserService(UserManager<ApplicationUser> userManager, ApplicationDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    public async Task<PagedResponse<AdminUserDto>> GetAllUsersAsync(string? searchTerm, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _userManager.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(u => 
                (u.FirstName + " " + u.LastName).Contains(searchTerm) || 
                u.Email!.Contains(searchTerm));
        }

        query = query.OrderByDescending(u => u.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        
        var users = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = new List<AdminUserDto>();

        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);
            
            var createdByName = "System";
            if (!string.IsNullOrEmpty(u.CreatedBy))
            {
                var creator = await _userManager.FindByIdAsync(u.CreatedBy);
                if (creator != null)
                {
                    createdByName = creator.FullName;
                }
            }
            
            dtos.Add(new AdminUserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email!,
                PhoneNumber = u.PhoneNumber,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt,
                IsActive = u.IsActive,
                Roles = roles,
                CreatedBy = u.CreatedBy,
                CreatedByName = createdByName
            });
        }

        return PagedResponse<AdminUserDto>.Create(dtos, pageNumber, pageSize, totalCount, "Users retrieved successfully.");
    }

    public async Task<ApiResponse> ToggleUserStatusAsync(string userId, bool isActive, string currentUserId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException(nameof(ApplicationUser), userId);
        }

        var oldStatus = user.IsActive;
        user.IsActive = isActive;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BadRequestException($"Failed to update user status: {errors}");
        }

        var history = new UserHistory
        {
            UserId = user.Id,
            Action = "StatusChanged",
            ChangedByUserId = currentUserId,
            Changes = JsonSerializer.Serialize(new { OldStatus = oldStatus, NewStatus = isActive })
        };
        _dbContext.UserHistories.Add(history);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ApiResponse.SuccessResponse($"User status updated successfully to {(isActive ? "Active" : "Inactive")}.");
    }

    public async Task<ApiResponse<AdminUserDetailsDto>> GetUserByIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException(nameof(ApplicationUser), userId);
        }

        var roles = await _userManager.GetRolesAsync(user);
        
        var createdByName = "System";
        if (!string.IsNullOrEmpty(user.CreatedBy))
        {
            var creator = await _userManager.FindByIdAsync(user.CreatedBy);
            if (creator != null)
            {
                createdByName = creator.FullName;
            }
        }

        var dto = new AdminUserDetailsDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email!,
            PhoneNumber = user.PhoneNumber,
            ProfileImageUrl = user.ProfileImageUrl,
            Address = user.Address,
            City = user.City,
            State = user.State,
            Country = user.Country,
            ZipCode = user.ZipCode,
            ThemeColor = user.ThemeColor,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LastLoginAt = user.LastLoginAt,
            IsActive = user.IsActive,
            Roles = roles,
            CreatedBy = user.CreatedBy,
            CreatedByName = createdByName
        };

        return ApiResponse<AdminUserDetailsDto>.SuccessResponse(dto, "User details retrieved successfully.");
    }

    public async Task<ApiResponse> UpdateUserAsync(string userId, UpdateAdminUserRequest request, string currentUserId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException(nameof(ApplicationUser), userId);
        }

        var oldData = new
        {
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            ProfileImageUrl = user.ProfileImageUrl,
            Address = user.Address,
            City = user.City,
            State = user.State,
            Country = user.Country,
            ZipCode = user.ZipCode,
            ThemeColor = user.ThemeColor
        };

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.PhoneNumber = request.PhoneNumber;
        user.ProfileImageUrl = request.ProfileImageUrl;
        user.Address = request.Address;
        user.City = request.City;
        user.State = request.State;
        user.Country = request.Country;
        user.ZipCode = request.ZipCode;
        user.ThemeColor = request.ThemeColor;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BadRequestException($"Failed to update user details: {errors}");
        }

        var history = new UserHistory
        {
            UserId = user.Id,
            Action = "Updated",
            ChangedByUserId = currentUserId,
            Changes = JsonSerializer.Serialize(new { Old = oldData, New = request })
        };
        _dbContext.UserHistories.Add(history);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ApiResponse.SuccessResponse("User updated successfully.");
    }

    public async Task<ApiResponse> CreateUserAsync(CreateAdminUserRequest request, string currentUserId, CancellationToken cancellationToken = default)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new BadRequestException("User with this email already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            EmailConfirmed = true,
            IsActive = true,
            CreatedBy = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        //var password = $"{request.FirstName.Substring(0, Math.Min(3, request.FirstName.Length))}@ethical.in";
        var password = $"Admin@123456";
        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BadRequestException($"Failed to create user: {errors}");
        }

        var roleResult = await _userManager.AddToRoleAsync(user, request.Role);
        if (!roleResult.Succeeded)
        {
            var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
            throw new BadRequestException($"Failed to assign role: {errors}");
        }

        var history = new UserHistory
        {
            UserId = user.Id,
            Action = "Created",
            ChangedByUserId = currentUserId,
            Changes = JsonSerializer.Serialize(new { New = request })
        };
        _dbContext.UserHistories.Add(history);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ApiResponse.SuccessResponse("User created successfully.");
    }
}
