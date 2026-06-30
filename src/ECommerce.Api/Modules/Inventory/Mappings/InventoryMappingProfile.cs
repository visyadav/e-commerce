using AutoMapper;
using ECommerce.Api.Modules.Inventory.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Api.Modules.Inventory.Mappings;

public class InventoryMappingProfile : Profile
{
    public InventoryMappingProfile()
    {
        CreateMap<Product, InventoryStatusDto>()
            .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Name));

        CreateMap<InventoryRecord, InventoryRecordDto>();
    }
}
