using ECommerce.Api.Modules.Catalog.Tags.DTOs;
using ECommerce.Shared.Responses;

namespace ECommerce.Api.Modules.Catalog.Tags.Interfaces;

public interface ITagService
{
    Task<ApiResponse<IEnumerable<TagDto>>> GetLookupAsync(CancellationToken cancellationToken = default);
}
