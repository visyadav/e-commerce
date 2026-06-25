using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Catalog.Products.Specifications;

public static class ProductSpecification
{
    public static IQueryable<Product> ApplySpecification(
        this IQueryable<Product> query,
        Guid? categoryId = null,
        Guid? brandId = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        string? searchTerm = null,
        string? sortBy = null)
    {
        // Include related Category and Brand entities
        query = query.Include(p => p.Category).Include(p => p.Brand);

        // Apply filters
        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (brandId.HasValue)
        {
            query = query.Where(p => p.BrandId == brandId.Value);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var searchPattern = searchTerm.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(searchPattern) ||
                (p.Description != null && p.Description.ToLower().Contains(searchPattern)) ||
                p.Sku.ToLower().Contains(searchPattern));
        }

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "name_asc" => query.OrderBy(p => p.Name),
            "name_desc" => query.OrderByDescending(p => p.Name),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt) // Default sorting: newest first
        };

        return query;
    }
}
