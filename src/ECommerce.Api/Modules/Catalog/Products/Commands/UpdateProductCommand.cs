using ECommerce.Api.Modules.Catalog.Products.DTOs;

namespace ECommerce.Api.Modules.Catalog.Products.Commands;

public record UpdateProductCommand(Guid Id, UpdateProductRequest Request);
