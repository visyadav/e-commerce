using ECommerce.Api.Modules.ServiceableAreas.DTOs;

namespace ECommerce.Api.Modules.ServiceableAreas.Interfaces;

public interface IServiceableAreaService
{
    Task<IEnumerable<ServiceableAreaDto>> GetAllAreasAsync();
    Task<ServiceableAreaDto?> GetAreaByIdAsync(Guid id);
    Task<ServiceableAreaDto> CreateAreaAsync(CreateServiceableAreaRequest request);
    Task<ServiceableAreaDto?> UpdateAreaAsync(Guid id, UpdateServiceableAreaRequest request);
    Task<bool> DeleteAreaAsync(Guid id);
    Task<ServiceabilityResultDto> CheckServiceabilityAsync(CheckServiceabilityRequest request);
}
