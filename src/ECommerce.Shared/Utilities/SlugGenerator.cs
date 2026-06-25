using ECommerce.Shared.Extensions;

namespace ECommerce.Shared.Utilities;

public static class SlugGenerator
{
    public static string Generate(string input)
    {
        return input.ToSlug();
    }

    public static string Generate(string input, string suffix)
    {
        var slug = input.ToSlug();
        return $"{slug}-{suffix.ToSlug()}";
    }
}
