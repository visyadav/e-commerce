using ECommerce.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace ECommerce.Api.Configurations;

public class PermissionPolicyProvider : DefaultAuthorizationPolicyProvider
{
    public PermissionPolicyProvider(IOptions<AuthorizationOptions> options) 
        : base(options)
    {
    }

    public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        // 1. Check if the policy is already explicitly registered (e.g., "AdminOnly")
        var policy = await base.GetPolicyAsync(policyName);
        if (policy != null)
        {
            return policy;
        }

        // 2. If the policy name is in the format "Module.Action" (e.g., "Catalog.Read")
        var parts = policyName.Split('.');
        if (parts.Length == 2)
        {
            var module = parts[0];
            var action = parts[1];

            // Dynamically build and return the policy with our custom PermissionRequirement
            var dynamicPolicy = new AuthorizationPolicyBuilder()
                .AddRequirements(new PermissionRequirement(module, action))
                .Build();

            return dynamicPolicy;
        }

        return null;
    }
}
