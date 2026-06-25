using AutoMapper;
using ECommerce.Api.Modules.Catalog.Products.DTOs;
using ECommerce.Api.Modules.Catalog.Products.Interfaces;
using ECommerce.Api.Modules.Catalog.Products.Specifications;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Exceptions;
using ECommerce.Shared.Responses;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Catalog.Products.Services;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProductService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<ProductDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Repository<Product>().Query()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (product == null)
        {
            throw new NotFoundException(nameof(Product), id);
        }

        var dto = _mapper.Map<ProductDto>(product);
        return ApiResponse<ProductDto>.SuccessResponse(dto, "Product retrieved successfully.");
    }

    public async Task<PagedResponse<ProductDto>> GetPaginatedAsync(
        Guid? categoryId = null,
        Guid? brandId = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        string? searchTerm = null,
        string? sortBy = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Repository<Product>().Query();
        
        // Apply specification filters and sorting
        var filteredQuery = query.ApplySpecification(categoryId, brandId, minPrice, maxPrice, searchTerm, sortBy);

        // Get total count for pagination metadata
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        // Get paginated items
        var items = await filteredQuery
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<ProductDto>>(items);
        return PagedResponse<ProductDto>.Create(dtos, pageNumber, pageSize, totalCount, "Products retrieved successfully.");
    }

    public async Task<ApiResponse<ProductDto>> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default)
    {
        // Validate Category
        var categoryExists = await _unitOfWork.Repository<Category>().ExistsAsync(c => c.Id == request.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new NotFoundException(nameof(Category), request.CategoryId);
        }

        // Validate Brand if provided
        if (request.BrandId.HasValue)
        {
            var brandExists = await _unitOfWork.Repository<Brand>().ExistsAsync(b => b.Id == request.BrandId.Value, cancellationToken);
            if (!brandExists)
            {
                throw new NotFoundException(nameof(Brand), request.BrandId.Value);
            }
        }

        // Map and save
        var product = _mapper.Map<Product>(request);
        
        await _unitOfWork.Repository<Product>().AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Load navigations for returning
        product.Category = (await _unitOfWork.Repository<Category>().GetByIdAsync(product.CategoryId, cancellationToken))!;
        if (product.BrandId.HasValue)
        {
            product.Brand = await _unitOfWork.Repository<Brand>().GetByIdAsync(product.BrandId.Value, cancellationToken);
        }

        var dto = _mapper.Map<ProductDto>(product);
        return ApiResponse<ProductDto>.SuccessResponse(dto, "Product created successfully.");
    }

    public async Task<ApiResponse<ProductDto>> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(id, cancellationToken);
        if (product == null)
        {
            throw new NotFoundException(nameof(Product), id);
        }

        // Validate Category
        var categoryExists = await _unitOfWork.Repository<Category>().ExistsAsync(c => c.Id == request.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new NotFoundException(nameof(Category), request.CategoryId);
        }

        // Validate Brand if provided
        if (request.BrandId.HasValue)
        {
            var brandExists = await _unitOfWork.Repository<Brand>().ExistsAsync(b => b.Id == request.BrandId.Value, cancellationToken);
            if (!brandExists)
            {
                throw new NotFoundException(nameof(Brand), request.BrandId.Value);
            }
        }

        // Map updates to existing entity
        _mapper.Map(request, product);

        _unitOfWork.Repository<Product>().Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Load navigations
        product.Category = (await _unitOfWork.Repository<Category>().GetByIdAsync(product.CategoryId, cancellationToken))!;
        if (product.BrandId.HasValue)
        {
            product.Brand = await _unitOfWork.Repository<Brand>().GetByIdAsync(product.BrandId.Value, cancellationToken);
        }

        var dto = _mapper.Map<ProductDto>(product);
        return ApiResponse<ProductDto>.SuccessResponse(dto, "Product updated successfully.");
    }

    public async Task<ApiResponse> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(id, cancellationToken);
        if (product == null)
        {
            throw new NotFoundException(nameof(Product), id);
        }

        _unitOfWork.Repository<Product>().Remove(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse.SuccessResponse("Product deleted successfully.");
    }
}
