using AutoMapper;
using ECommerce.Api.Modules.Admin.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Api.Modules.Admin.Mappings;

public class AdminMappingProfile : Profile
{
    public AdminMappingProfile()
    {
        CreateMap<MenuItem, ModuleDto>()
            .ForMember(dest => dest.Children, opt => opt.MapFrom(src => src.Children));

        CreateMap<CreateModuleRequest, MenuItem>();
        CreateMap<UpdateModuleRequest, MenuItem>();
    }
}
