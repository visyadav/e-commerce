using AutoMapper;
using ECommerce.Api.Modules.Users.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Api.Modules.Users.Mappings;

public class ProfileMappingProfile : Profile
{
    public ProfileMappingProfile()
    {
        CreateMap<UserAddress, UserAddressDto>();
        CreateMap<CreateUserAddressRequest, UserAddress>();
        CreateMap<UpdateUserAddressRequest, UserAddress>();

        CreateMap<ApplicationUser, UserProfileDto>()
            .ForMember(dest => dest.SavedAddresses, opt => opt.MapFrom(src => src.SavedAddresses));
    }
}
