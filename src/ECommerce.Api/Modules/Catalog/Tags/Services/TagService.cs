using AutoMapper;
using ECommerce.Api.Modules.Catalog.Tags.DTOs;
using ECommerce.Api.Modules.Catalog.Tags.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Catalog.Tags.Services;

public class TagService : ITagService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TagService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<IEnumerable<TagDto>>> GetLookupAsync(CancellationToken cancellationToken = default)
    {
        var tags = await _unitOfWork.Repository<Tag>()
            .Query()
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<IEnumerable<TagDto>>(tags);
        return ApiResponse<IEnumerable<TagDto>>.SuccessResponse(dtos, "Tags retrieved successfully.");
    }
}
