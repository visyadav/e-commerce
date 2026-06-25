namespace ECommerce.Api.Modules.Navigation.DTOs;

public class MenuItemDto
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public string? Icon { get; set; }
    public string? Url { get; set; }
    public int SortOrder { get; set; }
    public string? Module { get; set; }
    public List<MenuItemDto> Children { get; set; } = [];
}
