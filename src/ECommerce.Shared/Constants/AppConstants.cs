namespace ECommerce.Shared.Constants;

public static class AppConstants
{
    public static class Roles
    {
        public const string SuperAdmin = "SuperAdmin";
        public const string Admin = "Admin";
        public const string Customer = "Customer";
    }

    public static class Policies
    {
        public const string RequireSuperAdmin = "RequireSuperAdmin";
        public const string RequireAdmin = "RequireAdmin";
        public const string RequireCustomer = "RequireCustomer";
        public const string RequireAdminOrAbove = "RequireAdminOrAbove";
    }

    public static class Cache
    {
        public const int DefaultExpirationMinutes = 30;
        public const int ShortExpirationMinutes = 5;
        public const int LongExpirationMinutes = 120;
    }

    public static class Pagination
    {
        public const int DefaultPageSize = 10;
        public const int MaxPageSize = 100;
    }
}
