using ECommerce.Api.Modules.ServiceableAreas.DTOs;

namespace ECommerce.Api.Modules.ServiceableAreas.Interfaces;

public interface IServiceableAreaService
{
    Task<IEnumerable<ServiceableAreaDto>> GetAllAreasAsync();
    Task<ServiceableAreaDto?> GetAreaByIdAsync(Guid id);
    Task<ServiceableAreaDto> SaveAreaAsync(CreateServiceableAreaRequest request, Guid? id = null);
    Task<ServiceabilityResultDto> CheckServiceabilityAsync(CheckServiceabilityRequest request);
}
