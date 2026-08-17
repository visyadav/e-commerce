using System.Linq;
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
            .ForMember(dest => dest.ProductImageUrl, opt => opt.MapFrom(src =>
                src.Product.Images != null && src.Product.Images.Any()
                    ? src.Product.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault()
                    : null
            ))
            .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.Product.Price))
            .ForMember(dest => dest.OriginalPrice, opt => opt.MapFrom(src => src.Product.CompareAtPrice))
            .ForMember(dest => dest.Unit, opt => opt.MapFrom(src => "unit"));
    }
}
