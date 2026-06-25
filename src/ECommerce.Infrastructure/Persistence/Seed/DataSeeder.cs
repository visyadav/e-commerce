using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence.Context;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Persistence.Seed;

public class DataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ILogger<DataSeeder> logger)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            await SeedRolesAsync();
            await SeedAdminUserAsync();
            await SeedCategoriesAsync();
            await SeedBrandsAsync();
            await SeedMenuItemsAsync();
            await _context.SaveChangesAsync();

            _logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database");
            throw;
        }
    }

    private async Task SeedRolesAsync()
    {
        string[] roles = [AppConstants.Roles.SuperAdmin, AppConstants.Roles.Admin, AppConstants.Roles.Customer];

        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new IdentityRole(role));
                _logger.LogInformation("Created role: {Role}", role);
            }
        }
    }

    private async Task SeedAdminUserAsync()
    {
        const string adminEmail = "admin@ecommerce.com";

        if (await _userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "System",
                LastName = "Admin",
                EmailConfirmed = true,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(admin, "Admin@123456");
            if (result.Succeeded)
            {
                await _userManager.AddToRolesAsync(admin, [AppConstants.Roles.SuperAdmin, AppConstants.Roles.Admin]);
                _logger.LogInformation("Seeded admin user: {Email}", adminEmail);
            }
        }
    }

    private async Task SeedCategoriesAsync()
    {
        if (await _context.Categories.AnyAsync())
            return;

        var categories = new List<Category>
        {
            new() { Name = "Electronics", Slug = "electronics", SortOrder = 1 },
            new() { Name = "Clothing", Slug = "clothing", SortOrder = 2 },
            new() { Name = "Home & Garden", Slug = "home-garden", SortOrder = 3 },
            new() { Name = "Sports & Outdoors", Slug = "sports-outdoors", SortOrder = 4 },
            new() { Name = "Books", Slug = "books", SortOrder = 5 }
        };

        await _context.Categories.AddRangeAsync(categories);
        _logger.LogInformation("Seeded {Count} categories", categories.Count);
    }

    private async Task SeedBrandsAsync()
    {
        if (await _context.Brands.AnyAsync())
            return;

        var brands = new List<Brand>
        {
            new() { Name = "TechNova", Slug = "technova" },
            new() { Name = "UrbanStyle", Slug = "urbanstyle" },
            new() { Name = "HomeComfort", Slug = "homecomfort" }
        };

        await _context.Brands.AddRangeAsync(brands);
        _logger.LogInformation("Seeded {Count} brands", brands.Count);
    }

    private async Task SeedMenuItemsAsync()
    {
        if (await _context.MenuItems.AnyAsync())
            return;

        var adminRoles = $"{AppConstants.Roles.SuperAdmin},{AppConstants.Roles.Admin}";
        var customerRole = AppConstants.Roles.Customer;
        var allRoles = $"{AppConstants.Roles.SuperAdmin},{AppConstants.Roles.Admin},{AppConstants.Roles.Customer}";

        // ===================== ADMIN MENU ITEMS =====================
        var dashboard = new MenuItem
        {
            Title = "Dashboard",
            Icon = "dashboard",
            Url = "/admin/dashboard",
            SortOrder = 1,
            Module = "Dashboard",
            AllowedRoles = adminRoles
        };

        var catalog = new MenuItem
        {
            Title = "Catalog",
            Icon = "inventory_2",
            SortOrder = 2,
            Module = "Catalog",
            AllowedRoles = adminRoles,
            Children =
            [
                new MenuItem { Title = "Products", Icon = "category", Url = "/admin/catalog/products", SortOrder = 1, Module = "Catalog", AllowedRoles = adminRoles },
                new MenuItem { Title = "Categories", Icon = "account_tree", Url = "/admin/catalog/categories", SortOrder = 2, Module = "Catalog", AllowedRoles = adminRoles },
                new MenuItem { Title = "Brands", Icon = "branding_watermark", Url = "/admin/catalog/brands", SortOrder = 3, Module = "Catalog", AllowedRoles = adminRoles }
            ]
        };

        var inventory = new MenuItem
        {
            Title = "Inventory",
            Icon = "warehouse",
            Url = "/admin/inventory",
            SortOrder = 3,
            Module = "Inventory",
            AllowedRoles = adminRoles
        };

        var orders = new MenuItem
        {
            Title = "Orders",
            Icon = "shopping_bag",
            Url = "/admin/orders",
            SortOrder = 4,
            Module = "Orders",
            AllowedRoles = adminRoles
        };

        var customers = new MenuItem
        {
            Title = "Customers",
            Icon = "people",
            Url = "/admin/customers",
            SortOrder = 5,
            Module = "Users",
            AllowedRoles = adminRoles
        };

        var payments = new MenuItem
        {
            Title = "Payments",
            Icon = "payment",
            Url = "/admin/payments",
            SortOrder = 6,
            Module = "Payments",
            AllowedRoles = adminRoles
        };

        var coupons = new MenuItem
        {
            Title = "Coupons",
            Icon = "local_offer",
            Url = "/admin/coupons",
            SortOrder = 7,
            Module = "Coupons",
            AllowedRoles = adminRoles
        };

        var adminReviews = new MenuItem
        {
            Title = "Reviews",
            Icon = "star_rate",
            Url = "/admin/reviews",
            SortOrder = 8,
            Module = "Reviews",
            AllowedRoles = adminRoles
        };

        var adminNotifications = new MenuItem
        {
            Title = "Notifications",
            Icon = "notifications",
            Url = "/admin/notifications",
            SortOrder = 9,
            Module = "Notifications",
            AllowedRoles = adminRoles
        };

        var settings = new MenuItem
        {
            Title = "Settings",
            Icon = "settings",
            Url = "/admin/settings",
            SortOrder = 10,
            Module = "Admin",
            AllowedRoles = $"{AppConstants.Roles.SuperAdmin}"
        };

        // ===================== CUSTOMER MENU ITEMS =====================
        var myAccount = new MenuItem
        {
            Title = "My Account",
            Icon = "person",
            Url = "/account",
            SortOrder = 1,
            Module = "Users",
            AllowedRoles = customerRole
        };

        var myOrders = new MenuItem
        {
            Title = "My Orders",
            Icon = "receipt_long",
            Url = "/orders",
            SortOrder = 2,
            Module = "Orders",
            AllowedRoles = customerRole
        };

        var myWishlist = new MenuItem
        {
            Title = "Wishlist",
            Icon = "favorite",
            Url = "/wishlist",
            SortOrder = 3,
            Module = "Wishlist",
            AllowedRoles = customerRole
        };

        var myCart = new MenuItem
        {
            Title = "Cart",
            Icon = "shopping_cart",
            Url = "/cart",
            SortOrder = 4,
            Module = "Cart",
            AllowedRoles = customerRole
        };

        var myReviews = new MenuItem
        {
            Title = "My Reviews",
            Icon = "rate_review",
            Url = "/reviews",
            SortOrder = 5,
            Module = "Reviews",
            AllowedRoles = customerRole
        };

        var customerNotifications = new MenuItem
        {
            Title = "Notifications",
            Icon = "notifications",
            Url = "/notifications",
            SortOrder = 6,
            Module = "Notifications",
            AllowedRoles = customerRole
        };

        var adminMenuItems = new List<MenuItem>
        {
            dashboard, catalog, inventory, orders, customers,
            payments, coupons, adminReviews, adminNotifications, settings
        };

        var customerMenuItems = new List<MenuItem>
        {
            myAccount, myOrders, myWishlist, myCart, myReviews, customerNotifications
        };

        await _context.MenuItems.AddRangeAsync(adminMenuItems);
        await _context.MenuItems.AddRangeAsync(customerMenuItems);

        _logger.LogInformation("Seeded menu items for Admin and Customer roles");
    }
}
