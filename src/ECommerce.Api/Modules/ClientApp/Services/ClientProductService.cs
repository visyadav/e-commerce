using ECommerce.Api.Modules.ClientApp.DTOs;
using ECommerce.Api.Modules.ClientApp.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.ClientApp.Services;

public class ClientProductService : IClientProductService
{
    private readonly ApplicationDbContext _db;

    public ClientProductService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ClientProductDto>> GetProductsAsync(ClientProductQueryParameters query)
    {
        var dbQuery = _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsActive && !p.IsDeleted);

        if (query.IsDailyEssential.HasValue && query.IsDailyEssential.Value)
        {
            var hasFeatured = await dbQuery.AnyAsync(p => p.IsFeatured);
            if (hasFeatured)
            {
                dbQuery = dbQuery.Where(p => p.IsFeatured);
            }
        }

        if (!string.IsNullOrWhiteSpace(query.CategorySlug) && query.CategorySlug.ToLower() != "all")
        {
            dbQuery = dbQuery.Where(p => p.Category.Slug.ToLower() == query.CategorySlug.ToLower());
        }
        else if (query.CategoryId.HasValue && query.CategoryId.Value != Guid.Empty)
        {
            dbQuery = dbQuery.Where(p => p.CategoryId == query.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var searchLower = query.Search.Trim().ToLower();
            dbQuery = dbQuery.Where(p =>
                p.Name.ToLower().Contains(searchLower) ||
                (p.Description != null && p.Description.ToLower().Contains(searchLower)));
        }

        var products = await dbQuery
            .OrderByDescending(p => p.IsFeatured)
            .ThenBy(p => p.Name)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return products.Select(MapToDto);
    }

    public async Task<IEnumerable<ClientProductDto>> GetPopularProductsAsync(int limit = 10)
    {
        var products = await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.OrderItems)
            .Where(p => p.IsActive && !p.IsDeleted)
            .OrderByDescending(p => p.OrderItems.Count)
            .ThenByDescending(p => p.IsFeatured)
            .ThenBy(p => p.Name)
            .Take(limit)
            .ToListAsync();

        return products.Select(MapToDto);
    }

    public async Task<IEnumerable<ClientCategoryDto>> GetCategoriesAsync()
    {
        var categories = await _db.Categories
            .AsNoTracking()
            .Where(c => c.IsActive && !c.IsDeleted)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();

        return categories.Select(c => new ClientCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            ImageUrl = c.ImageUrl,
            SortOrder = c.SortOrder
        });
    }

    public async Task<ClientProductDto?> GetProductByIdAsync(Guid id)
    {
        var p = await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive && !p.IsDeleted);

        return p == null ? null : MapToDto(p);
    }

    private static ClientProductDto MapToDto(Product p)
    {
        var primaryImg = p.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
            ?? p.Images.FirstOrDefault()?.ImageUrl 
            ?? "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80";

        var discountPct = p.CompareAtPrice.HasValue && p.CompareAtPrice.Value > p.Price
            ? $"{Math.Round(((p.CompareAtPrice.Value - p.Price) / p.CompareAtPrice.Value) * 100)}% OFF"
            : null;

        var allImgs = p.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).ToList();
        if (allImgs.Count == 0)
        {
            allImgs.Add(primaryImg);
        }

        return new ClientProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Slug = p.Slug,
            Price = p.Price,
            OriginalPrice = p.CompareAtPrice,
            Unit = string.IsNullOrWhiteSpace(p.Dimensions) ? "500 ml" : p.Dimensions,
            ImageUrl = primaryImg,
            ImageUrls = allImgs,
            Badge = p.IsFeatured ? "Daily Essential" : null,
            DiscountPercentage = discountPct,
            Rating = 4.8,
            IsVeg = true,
            IsDailyEssential = p.IsFeatured,
            StockQuantity = p.StockQuantity,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name ?? "Dairy",
            CategorySlug = p.Category?.Slug ?? "dairy"
        };
    }
}
