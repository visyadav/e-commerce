using AutoMapper;
using ECommerce.Api.Modules.Catalog.Tags.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Api.Modules.Catalog.Tags.Mappings;

public class TagMappingProfile : Profile
{
    public TagMappingProfile()
    {
        CreateMap<Tag, TagDto>();
    }
}
