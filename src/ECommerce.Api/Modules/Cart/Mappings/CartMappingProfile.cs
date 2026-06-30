using AutoMapper;
using ECommerce.Api.Modules.Cart.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Api.Modules.Cart.Mappings;

public class CartMappingProfile : Profile
{
    public CartMappingProfile()
    {
        CreateMap<CartItem, CartItemDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
            .ForMember(dest => dest.ProductSku, opt => opt.MapFrom(src => src.Product.Sku))
            .ForMember(dest => dest.ProductImageUrl, opt => opt.MapFrom(src => src.Product.ImageUrl))
            .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.Product.Price));
    }
}
