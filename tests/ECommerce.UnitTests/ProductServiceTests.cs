using AutoMapper;
using ECommerce.Api.Modules.Catalog.Products.DTOs;
using ECommerce.Api.Modules.Catalog.Products.Services;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence.Context;
using ECommerce.Infrastructure.Persistence.Repositories;
using ECommerce.Shared.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ECommerce.UnitTests;

public class ProductServiceTests
{
    private readonly IMapper _mapper;

    public ProductServiceTests()
    {
        var mapperMock = new Mock<IMapper>();
        mapperMock.Setup(m => m.Map<ProductDto>(It.IsAny<Product>()))
            .Returns((object src) =>
            {
                var product = (Product)src;
                return new ProductDto
                {
                    Id = product.Id,
                    Name = product.Name,
                    Slug = product.Slug,
                    Sku = product.Sku,
                    Price = product.Price,
                    StockQuantity = product.StockQuantity,
                    CategoryId = product.CategoryId,
                    CategoryName = product.Category?.Name ?? string.Empty,
                    BrandId = product.BrandId,
                    BrandName = product.Brand?.Name
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
    public async Task GetByIdAsync_WhenProductDoesNotExist_ShouldThrowNotFoundException()
    {
        // Arrange
        using var context = CreateDbContext();
        var unitOfWork = new UnitOfWork(context);
        var productService = new ProductService(unitOfWork, _mapper);
        var nonExistentId = Guid.NewGuid();

        // Act
        var act = () => productService.GetByIdAsync(nonExistentId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetByIdAsync_WhenProductExists_ShouldReturnProduct()
    {
        // Arrange
        using var context = CreateDbContext();
        var category = new Category { Id = Guid.NewGuid(), Name = "Electronics", Slug = "electronics" };
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Smartphone",
            Slug = "smartphone",
            Sku = "PHONE-123",
            Price = 699.99m,
            StockQuantity = 50,
            CategoryId = category.Id,
            Category = category
        };

        await context.Categories.AddAsync(category);
        await context.Products.AddAsync(product);
        await context.SaveChangesAsync();

        var unitOfWork = new UnitOfWork(context);
        var productService = new ProductService(unitOfWork, _mapper);

        // Act
        var response = await productService.GetByIdAsync(product.Id);

        // Assert
        response.Success.Should().BeTrue();
        response.Data.Should().NotBeNull();
        response.Data!.Name.Should().Be("Smartphone");
        response.Data.CategoryName.Should().Be("Electronics");
    }
}
