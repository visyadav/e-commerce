namespace ECommerce.Shared.Helpers;

public static class DateTimeHelper
{
    public static DateTime UtcNow => DateTime.UtcNow;

    public static string ToReadableString(DateTime dateTime)
    {
        return dateTime.ToString("MMMM dd, yyyy 'at' hh:mm tt");
    }

    public static string ToIsoString(DateTime dateTime)
    {
        return dateTime.ToString("o");
    }
}
