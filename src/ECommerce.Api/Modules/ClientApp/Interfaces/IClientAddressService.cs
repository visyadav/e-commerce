using ECommerce.Api.Modules.ClientApp.DTOs;

namespace ECommerce.Api.Modules.ClientApp.Interfaces;

public interface IClientAddressService
{
    Task<IEnumerable<ClientUserAddressDto>> GetUserAddressesAsync(string userId);
    Task<ClientUserAddressDto> CreateUserAddressAsync(string userId, CreateClientUserAddressRequest request);
}
