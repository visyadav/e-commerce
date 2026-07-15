using AutoMapper;
using ECommerce.Api.Modules.Catalog.Products.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Shared.Utilities;

namespace ECommerce.Api.Modules.Catalog.Products.Mappings;

public class ProductMappingProfile : Profile
{
    public ProductMappingProfile()
    {
        CreateMap<Product, ProductDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.Brand != null ? src.Brand.Name : null))
            .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src => src.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).ToList()));

        CreateMap<CreateProductRequest, Product>()
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => SlugGenerator.Generate(src.Name)))
            .ForMember(dest => dest.Tags, opt => opt.Ignore());

        CreateMap<UpdateProductRequest, Product>()
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => SlugGenerator.Generate(src.Name)))
            .ForMember(dest => dest.Tags, opt => opt.Ignore());
    }
}
