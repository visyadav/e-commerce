using AutoMapper;
using ECommerce.Api.Modules.ClientApp.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Api.Modules.ClientApp.Mappings;

public class ClientAddressMappingProfile : Profile
{
    public ClientAddressMappingProfile()
    {
        CreateMap<UserAddress, ClientUserAddressDto>();
        CreateMap<CreateClientUserAddressRequest, UserAddress>();
    }
}
