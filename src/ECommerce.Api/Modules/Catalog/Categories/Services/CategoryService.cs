using AutoMapper;
using ECommerce.Api.Modules.Catalog.Categories.DTOs;
using ECommerce.Api.Modules.Catalog.Categories.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Exceptions;
using ECommerce.Shared.Responses;
using ECommerce.Shared.Utilities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Catalog.Categories.Services;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<CategoryDto>>> GetLookupAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _unitOfWork.Repository<Category>().Query()
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<CategoryDto>>(categories);
        return ApiResponse<List<CategoryDto>>.SuccessResponse(dtos, "Category lookup retrieved successfully.");
    }

    public async Task<PagedResponse<CategoryDto>> GetPaginatedAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Repository<Category>().Query()
            .Include(c => c.ParentCategory)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(c => c.Name.Contains(searchTerm) || (c.Description != null && c.Description.Contains(searchTerm)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var categories = await query
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<CategoryDto>>(categories);
        return PagedResponse<CategoryDto>.Create(dtos, pageNumber, pageSize, totalCount, "Categories retrieved successfully.");
    }

    public async Task<ApiResponse<CategoryDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _unitOfWork.Repository<Category>().Query()
            .Include(c => c.ParentCategory)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category == null)
        {
            throw new NotFoundException(nameof(Category), id);
        }

        var dto = _mapper.Map<CategoryDto>(category);
        return ApiResponse<CategoryDto>.SuccessResponse(dto, "Category retrieved successfully.");
    }

    public async Task<ApiResponse<CategoryDto>> CreateAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        // Validate ParentCategory if provided
        if (request.ParentCategoryId.HasValue)
        {
            var parentExists = await _unitOfWork.Repository<Category>().ExistsAsync(c => c.Id == request.ParentCategoryId.Value, cancellationToken);
            if (!parentExists)
            {
                throw new NotFoundException(nameof(Category), request.ParentCategoryId.Value);
            }
        }

        var category = _mapper.Map<Category>(request);
        category.Slug = string.IsNullOrWhiteSpace(request.Slug) ? SlugGenerator.Generate(request.Name) : request.Slug;

        await _unitOfWork.Repository<Category>().AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Load relations for return DTO
        if (category.ParentCategoryId.HasValue)
        {
            category.ParentCategory = await _unitOfWork.Repository<Category>().GetByIdAsync(category.ParentCategoryId.Value, cancellationToken);
        }

        var dto = _mapper.Map<CategoryDto>(category);
        return ApiResponse<CategoryDto>.SuccessResponse(dto, "Category created successfully.");
    }

    public async Task<ApiResponse<CategoryDto>> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id, cancellationToken);
        if (category == null)
        {
            throw new NotFoundException(nameof(Category), id);
        }

        // Prevent self-referencing hierarchy loops
        if (request.ParentCategoryId.HasValue && request.ParentCategoryId.Value == id)
        {
            throw new BadRequestException("A category cannot be its own parent.");
        }

        // Validate ParentCategory if provided
        if (request.ParentCategoryId.HasValue)
        {
            var parentExists = await _unitOfWork.Repository<Category>().ExistsAsync(c => c.Id == request.ParentCategoryId.Value, cancellationToken);
            if (!parentExists)
            {
                throw new NotFoundException(nameof(Category), request.ParentCategoryId.Value);
            }
        }

        _mapper.Map(request, category);
        category.Slug = string.IsNullOrWhiteSpace(request.Slug) ? SlugGenerator.Generate(request.Name) : request.Slug;

        _unitOfWork.Repository<Category>().Update(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Load relations
        if (category.ParentCategoryId.HasValue)
        {
            category.ParentCategory = await _unitOfWork.Repository<Category>().GetByIdAsync(category.ParentCategoryId.Value, cancellationToken);
        }

        var dto = _mapper.Map<CategoryDto>(category);
        return ApiResponse<CategoryDto>.SuccessResponse(dto, "Category updated successfully.");
    }

    public async Task<ApiResponse> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id, cancellationToken);
        if (category == null)
        {
            throw new NotFoundException(nameof(Category), id);
        }

        // Check if there are subcategories
        var hasSubcategories = await _unitOfWork.Repository<Category>().ExistsAsync(c => c.ParentCategoryId == id, cancellationToken);
        if (hasSubcategories)
        {
            throw new BadRequestException("Cannot delete a category that has subcategories. Reassign or delete the subcategories first.");
        }

        // Check if there are associated products
        var hasProducts = await _unitOfWork.Repository<Product>().ExistsAsync(p => p.CategoryId == id, cancellationToken);
        if (hasProducts)
        {
            throw new BadRequestException("Cannot delete a category with active products. Reassign the products to another category first.");
        }

        _unitOfWork.Repository<Category>().Remove(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse.SuccessResponse("Category deleted successfully.");
    }
}
