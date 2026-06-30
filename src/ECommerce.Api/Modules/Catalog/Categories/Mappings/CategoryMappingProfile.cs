using AutoMapper;
using ECommerce.Api.Modules.Catalog.Categories.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Shared.Utilities;

namespace ECommerce.Api.Modules.Catalog.Categories.Mappings;

public class CategoryMappingProfile : Profile
{
    public CategoryMappingProfile()
    {
        CreateMap<Category, CategoryDto>()
            .ForMember(dest => dest.ParentCategoryName, opt => opt.MapFrom(src => src.ParentCategory != null ? src.ParentCategory.Name : null));

        CreateMap<CreateCategoryRequest, Category>()
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => SlugGenerator.Generate(src.Name)));

        CreateMap<UpdateCategoryRequest, Category>()
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => SlugGenerator.Generate(src.Name)));
    }
}
