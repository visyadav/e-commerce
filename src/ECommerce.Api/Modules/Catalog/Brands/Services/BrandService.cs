using AutoMapper;
using ECommerce.Api.Modules.Catalog.Brands.DTOs;
using ECommerce.Api.Modules.Catalog.Brands.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Exceptions;
using ECommerce.Shared.Responses;
using ECommerce.Shared.Utilities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Catalog.Brands.Services;

public class BrandService : IBrandService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public BrandService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<BrandDto>>> GetLookupAsync(CancellationToken cancellationToken = default)
    {
        var brands = await _unitOfWork.Repository<Brand>().Query()
            .OrderBy(b => b.Name)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<BrandDto>>(brands);
        return ApiResponse<List<BrandDto>>.SuccessResponse(dtos, "Brand lookup retrieved successfully.");
    }

    public async Task<PagedResponse<BrandDto>> GetPaginatedAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Repository<Brand>().Query();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(b => b.Name.Contains(searchTerm) || (b.Description != null && b.Description.Contains(searchTerm)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var brands = await query
            .OrderBy(b => b.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<BrandDto>>(brands);
        return PagedResponse<BrandDto>.Create(dtos, pageNumber, pageSize, totalCount, "Brands retrieved successfully.");
    }

    public async Task<ApiResponse<BrandDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var brand = await _unitOfWork.Repository<Brand>().GetByIdAsync(id, cancellationToken);
        if (brand == null)
        {
            throw new NotFoundException(nameof(Brand), id);
        }

        var dto = _mapper.Map<BrandDto>(brand);
        return ApiResponse<BrandDto>.SuccessResponse(dto, "Brand retrieved successfully.");
    }

    public async Task<ApiResponse<BrandDto>> CreateAsync(CreateBrandRequest request, CancellationToken cancellationToken = default)
    {
        var brand = _mapper.Map<Brand>(request);
        brand.Slug = string.IsNullOrWhiteSpace(request.Slug) ? SlugGenerator.Generate(request.Name) : request.Slug;

        await _unitOfWork.Repository<Brand>().AddAsync(brand, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<BrandDto>(brand);
        return ApiResponse<BrandDto>.SuccessResponse(dto, "Brand created successfully.");
    }

    public async Task<ApiResponse<BrandDto>> UpdateAsync(Guid id, UpdateBrandRequest request, CancellationToken cancellationToken = default)
    {
        var brand = await _unitOfWork.Repository<Brand>().GetByIdAsync(id, cancellationToken);
        if (brand == null)
        {
            throw new NotFoundException(nameof(Brand), id);
        }

        _mapper.Map(request, brand);
        brand.Slug = string.IsNullOrWhiteSpace(request.Slug) ? SlugGenerator.Generate(request.Name) : request.Slug;

        _unitOfWork.Repository<Brand>().Update(brand);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<BrandDto>(brand);
        return ApiResponse<BrandDto>.SuccessResponse(dto, "Brand updated successfully.");
    }

    public async Task<ApiResponse> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var brand = await _unitOfWork.Repository<Brand>().GetByIdAsync(id, cancellationToken);
        if (brand == null)
        {
            throw new NotFoundException(nameof(Brand), id);
        }

        // Check if there are associated products
        var hasProducts = await _unitOfWork.Repository<Product>().ExistsAsync(p => p.BrandId == id, cancellationToken);
        if (hasProducts)
        {
            throw new BadRequestException("Cannot delete a brand with active products. Reassign the products to another brand first.");
        }

        _unitOfWork.Repository<Brand>().Remove(brand);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse.SuccessResponse("Brand deleted successfully.");
    }
}
