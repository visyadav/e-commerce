using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using ECommerce.Api.Modules.Navigation.DTOs;
using ECommerce.Api.Modules.Navigation.Services;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Infrastructure.Identity;
using ECommerce.Infrastructure.Persistence.Context;
using ECommerce.Infrastructure.Persistence.Repositories;
using ECommerce.Shared.Constants;
using ECommerce.Shared.Responses;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ECommerce.UnitTests;

public class PermissionTests
{
    private readonly IMapper _mapper;

    public PermissionTests()
    {
        var mapperMock = new Mock<IMapper>();
        mapperMock.Setup(m => m.Map<MenuItemDto>(It.IsAny<MenuItem>()))
            .Returns((object src) =>
            {
                var m = (MenuItem)src;
                return new MenuItemDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Url = m.Url,
                    Icon = m.Icon,
                    SortOrder = m.SortOrder,
                    Module = m.Module
                };
            });
        _mapper = mapperMock.Object;
    }

    private ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task HandleRequirementAsync_SuperAdmin_ShouldAlwaysSucceed()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var handler = new PermissionAuthorizationHandler(dbContext);

        var requirements = new[] { new PermissionRequirement("Catalog", "Create") };
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "admin-123"),
            new Claim(ClaimTypes.Role, AppConstants.Roles.SuperAdmin)
        }, "mock"));

        var context = new AuthorizationHandlerContext(requirements, user, null);

        // Act
        await handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeTrue();
    }

    [Fact]
    public async Task HandleRequirementAsync_UserSpecificGrantOverride_ShouldSucceed()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var handler = new PermissionAuthorizationHandler(dbContext);

        var userId = "user-123";
        var menuItem = new MenuItem
        {
            Id = Guid.NewGuid(),
            Title = "Products",
            Url = "/products",
            Module = "Catalog",
            IsActive = true
        };
        await dbContext.MenuItems.AddAsync(menuItem);

        var userPermission = new UserMenuPermission
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            MenuItemId = menuItem.Id,
            CanRead = false,
            CanCreate = true, // Directly granted Create
            CanUpdate = false,
            CanDelete = false
        };
        await dbContext.UserMenuPermissions.AddAsync(userPermission);
        await dbContext.SaveChangesAsync();

        var requirements = new[] { new PermissionRequirement("Catalog", "Create") };
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Role, "Customer") // Has a generic role
        }, "mock"));

        var context = new AuthorizationHandlerContext(requirements, user, null);

        // Act
        await handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeTrue();
    }

    [Fact]
    public async Task HandleRequirementAsync_UserSpecificDenyOverride_ShouldFailEvenIfRoleHasAccess()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var handler = new PermissionAuthorizationHandler(dbContext);

        var userId = "user-123";
        var roleId = "role-manager";
        var menuItem = new MenuItem
        {
            Id = Guid.NewGuid(),
            Title = "Products",
            Url = "/products",
            Module = "Catalog",
            IsActive = true
        };
        await dbContext.MenuItems.AddAsync(menuItem);

        // Seed a role with permission
        var role = new IdentityRole { Id = roleId, Name = "Manager" };
        await dbContext.Roles.AddAsync(role);

        var rolePermission = new RoleMenuPermission
        {
            Id = Guid.NewGuid(),
            RoleId = roleId,
            MenuItemId = menuItem.Id,
            CanRead = true,
            CanCreate = true,
            CanUpdate = true,
            CanDelete = true
        };
        await dbContext.RoleMenuPermissions.AddAsync(rolePermission);

        // Seed a user deny override
        var userPermission = new UserMenuPermission
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            MenuItemId = menuItem.Id,
            CanRead = true,
            CanCreate = false, // Denied Create
            CanUpdate = true,
            CanDelete = true
        };
        await dbContext.UserMenuPermissions.AddAsync(userPermission);
        await dbContext.SaveChangesAsync();

        var requirements = new[] { new PermissionRequirement("Catalog", "Create") };
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Role, "Manager") // User is in the role that has access
        }, "mock"));

        var context = new AuthorizationHandlerContext(requirements, user, null);

        // Act
        await handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeFalse();
    }

    [Fact]
    public async Task HandleRequirementAsync_RoleHasAccessAndNoUserOverride_ShouldSucceed()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var handler = new PermissionAuthorizationHandler(dbContext);

        var userId = "user-123";
        var roleId = "role-manager";
        var menuItem = new MenuItem
        {
            Id = Guid.NewGuid(),
            Title = "Products",
            Url = "/products",
            Module = "Catalog",
            IsActive = true
        };
        await dbContext.MenuItems.AddAsync(menuItem);

        var role = new IdentityRole { Id = roleId, Name = "Manager" };
        await dbContext.Roles.AddAsync(role);

        var rolePermission = new RoleMenuPermission
        {
            Id = Guid.NewGuid(),
            RoleId = roleId,
            MenuItemId = menuItem.Id,
            CanRead = true,
            CanCreate = true,
            CanUpdate = false,
            CanDelete = false
        };
        await dbContext.RoleMenuPermissions.AddAsync(rolePermission);
        await dbContext.SaveChangesAsync();

        var requirements = new[] { new PermissionRequirement("Catalog", "Create") };
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Role, "Manager")
        }, "mock"));

        var context = new AuthorizationHandlerContext(requirements, user, null);

        // Act
        await handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeTrue();
    }

    [Fact]
    public async Task GetSideMenuForRolesAsync_WithUserOverridesAndRolePermissions_ShouldFilterCorrectly()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var unitOfWork = new UnitOfWork(dbContext);

        // Seed some menu items
        var item1 = new MenuItem { Id = Guid.NewGuid(), Title = "Dashboard", Url = "/dashboard", IsActive = true, SortOrder = 1 };
        var item2 = new MenuItem { Id = Guid.NewGuid(), Title = "Products", Url = "/products", IsActive = true, SortOrder = 2 };
        var item3 = new MenuItem { Id = Guid.NewGuid(), Title = "Settings", Url = "/settings", IsActive = true, SortOrder = 3, AllowedRoles = "SuperAdmin" };

        await dbContext.MenuItems.AddRangeAsync(item1, item2, item3);

        // Seed role permission for "Manager" on Products
        var role = new IdentityRole { Id = "role-manager", Name = "Manager" };
        await dbContext.Roles.AddAsync(role);

        var rolePermission = new RoleMenuPermission
        {
            Id = Guid.NewGuid(),
            RoleId = role.Id,
            MenuItemId = item2.Id,
            CanRead = true
        };
        await dbContext.RoleMenuPermissions.AddAsync(rolePermission);

        // Seed user override: Grant user access to Dashboard, Deny access to Products
        var userId = "user-123";
        var userOverride1 = new UserMenuPermission
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            MenuItemId = item1.Id,
            CanRead = true // Grant Dashboard
        };
        var userOverride2 = new UserMenuPermission
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            MenuItemId = item2.Id,
            CanRead = false // Deny Products (overrides Manager role)
        };
        await dbContext.UserMenuPermissions.AddRangeAsync(userOverride1, userOverride2);
        await dbContext.SaveChangesAsync();

        var currentUserServiceMock = new Mock<ICurrentUserService>();
        currentUserServiceMock.Setup(u => u.UserId).Returns(userId);
        currentUserServiceMock.Setup(u => u.IsInRole(It.IsAny<string>())).Returns(false);

        var navigationService = new NavigationService(unitOfWork, _mapper, currentUserServiceMock.Object);

        // Act
        var response = await navigationService.GetSideMenuForRolesAsync(new[] { "Manager" });

        // Assert
        response.Success.Should().BeTrue();
        response.Data.Should().NotBeNull();
        
        // Dashboard should be present due to user grant
        response.Data.Any(m => m.Title == "Dashboard").Should().BeTrue();
        
        // Products should be filtered out due to user deny override
        response.Data.Any(m => m.Title == "Products").Should().BeFalse();

        // Settings should be filtered out because user is not SuperAdmin
        response.Data.Any(m => m.Title == "Settings").Should().BeFalse();
    }
}
