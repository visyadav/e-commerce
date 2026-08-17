using ECommerce.Api.Modules.ClientApp.DTOs;

namespace ECommerce.Api.Modules.ClientApp.Interfaces;

public interface IClientProductService
{
    Task<IEnumerable<ClientProductDto>> GetProductsAsync(ClientProductQueryParameters query);
    Task<IEnumerable<ClientProductDto>> GetPopularProductsAsync(int limit = 10);
    Task<IEnumerable<ClientCategoryDto>> GetCategoriesAsync();
    Task<ClientProductDto?> GetProductByIdAsync(Guid id);
}
