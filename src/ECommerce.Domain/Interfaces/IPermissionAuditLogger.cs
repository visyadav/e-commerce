namespace ECommerce.Domain.Interfaces;

public interface IPermissionAuditLogger
{
    void LogRolePermissionsChange(string adminEmail, string roleName, string details);
    void LogUserPermissionsChange(string adminEmail, string targetUserEmail, string details);
    void LogModuleChange(string adminEmail, string moduleName, string action, string details);
}
