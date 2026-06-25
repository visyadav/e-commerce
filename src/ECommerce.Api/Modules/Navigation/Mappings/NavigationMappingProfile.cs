using AutoMapper;
using ECommerce.Api.Modules.Navigation.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Api.Modules.Navigation.Mappings;

public class NavigationMappingProfile : Profile
{
    public NavigationMappingProfile()
    {
        CreateMap<MenuItem, MenuItemDto>()
            .ForMember(dest => dest.Children, opt => opt.MapFrom(src => src.Children));
    }
}
