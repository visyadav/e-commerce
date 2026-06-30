using ECommerce.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Logging;

public class PermissionAuditLogger : IPermissionAuditLogger
{
    private readonly ILogger<PermissionAuditLogger> _logger;

    public PermissionAuditLogger(ILogger<PermissionAuditLogger> logger)
    {
        _logger = logger;
    }

    public void LogRolePermissionsChange(string adminEmail, string roleName, string details)
    {
        _logger.LogWarning(
            "🔒 [Security Audit] Role permissions modified!\n" +
            "  Admin: {AdminEmail}\n" +
            "  Role: {RoleName}\n" +
            "  Details: {Details}",
            adminEmail, roleName, details);
    }

    public void LogUserPermissionsChange(string adminEmail, string targetUserEmail, string details)
    {
        _logger.LogWarning(
            "🔒 [Security Audit] User permission overrides modified!\n" +
            "  Admin: {AdminEmail}\n" +
            "  Target User: {TargetUserEmail}\n" +
            "  Details: {Details}",
            adminEmail, targetUserEmail, details);
    }

    public void LogModuleChange(string adminEmail, string moduleName, string action, string details)
    {
        _logger.LogWarning(
            "🔒 [Security Audit] Dynamic module modified!\n" +
            "  Admin: {AdminEmail}\n" +
            "  Module: {ModuleName}\n" +
            "  Action: {Action}\n" +
            "  Details: {Details}",
            adminEmail, moduleName, action, details);
    }
}
