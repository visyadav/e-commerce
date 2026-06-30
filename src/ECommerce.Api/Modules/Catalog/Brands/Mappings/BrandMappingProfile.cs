using AutoMapper;
using ECommerce.Api.Modules.Catalog.Brands.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Shared.Utilities;

namespace ECommerce.Api.Modules.Catalog.Brands.Mappings;

public class BrandMappingProfile : Profile
{
    public BrandMappingProfile()
    {
        CreateMap<Brand, BrandDto>();

        CreateMap<CreateBrandRequest, Brand>()
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => SlugGenerator.Generate(src.Name)));

        CreateMap<UpdateBrandRequest, Brand>()
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => SlugGenerator.Generate(src.Name)));
    }
}
