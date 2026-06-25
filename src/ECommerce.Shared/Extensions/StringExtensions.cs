using System.Text.RegularExpressions;

namespace ECommerce.Shared.Extensions;

public static partial class StringExtensions
{
    public static string ToSlug(this string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        var slug = value.ToLowerInvariant().Trim();
        slug = SlugWhitespace().Replace(slug, "-");
        slug = SlugInvalidChars().Replace(slug, string.Empty);
        slug = SlugMultipleDashes().Replace(slug, "-");
        slug = slug.Trim('-');

        return slug;
    }

    public static string Truncate(this string value, int maxLength)
    {
        if (string.IsNullOrEmpty(value)) return value;
        return value.Length <= maxLength ? value : value[..maxLength];
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex SlugWhitespace();

    [GeneratedRegex(@"[^a-z0-9\-]")]
    private static partial Regex SlugInvalidChars();

    [GeneratedRegex(@"-{2,}")]
    private static partial Regex SlugMultipleDashes();
}
