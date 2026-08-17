using AutoMapper;
using ECommerce.Api.Modules.ServiceableAreas.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Api.Modules.ServiceableAreas.Mappings;

public class ServiceableAreaMappingProfile : Profile
{
    public ServiceableAreaMappingProfile()
    {
        CreateMap<ServiceableArea, ServiceableAreaDto>();
        CreateMap<CreateServiceableAreaRequest, ServiceableArea>();
        CreateMap<UpdateServiceableAreaRequest, ServiceableArea>();
    }
}
