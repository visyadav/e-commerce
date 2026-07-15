namespace ECommerce.Api.Modules.Catalog.Tags.DTOs;

public class TagDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
}
