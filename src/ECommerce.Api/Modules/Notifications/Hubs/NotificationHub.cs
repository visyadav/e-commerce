using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ECommerce.Api.Modules.Notifications.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public const string AdminGroup = "Admins";

    public override async Task OnConnectedAsync()
    {
        var user = Context.User;
        if (user != null && (user.IsInRole(AppConstants.Roles.Admin) || user.IsInRole(AppConstants.Roles.SuperAdmin)))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, AdminGroup);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var user = Context.User;
        if (user != null && (user.IsInRole(AppConstants.Roles.Admin) || user.IsInRole(AppConstants.Roles.SuperAdmin)))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, AdminGroup);
        }

        await base.OnDisconnectedAsync(exception);
    }
}
