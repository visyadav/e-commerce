using Microsoft.AspNetCore.Authorization;

namespace ECommerce.Api.Filters;

public class HasPermissionAttribute : AuthorizeAttribute
{
    public HasPermissionAttribute(string module, string action)
        : base(policy: $"{module}.{action}")
    {
    }
}
