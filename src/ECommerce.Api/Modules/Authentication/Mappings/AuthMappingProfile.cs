using AutoMapper;
using ECommerce.Api.Modules.Authentication.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Api.Modules.Authentication.Mappings;

public class AuthMappingProfile : Profile
{
    public AuthMappingProfile()
    {
        CreateMap<RegisterRequest, ApplicationUser>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.EmailConfirmed, opt => opt.MapFrom(_ => true)) // Auto-confirm in B2C demo
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true));

        CreateMap<CustomerRegisterRequest, ApplicationUser>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.PhoneNumber))
            .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.EmailConfirmed, opt => opt.MapFrom(_ => true))
            .ForMember(dest => dest.PhoneNumberConfirmed, opt => opt.MapFrom(_ => true))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true));
    }
}
