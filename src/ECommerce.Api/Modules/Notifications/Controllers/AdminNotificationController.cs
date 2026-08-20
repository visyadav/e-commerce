using ECommerce.Api.Common;
using ECommerce.Api.Filters;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Notifications.Controllers;

[Route("api/v1/admin/notifications")]
[Route("api/v1/AdminNotification")]
public class AdminNotificationController : BaseApiController
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminNotificationController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    [HasPermission("Notifications", "Read")]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] bool unreadOnly = false,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var userId = CurrentUserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.FailureResponse("User ID missing."));
        }

        var query = _unitOfWork.Repository<Notification>().Query()
            .Where(n => n.UserId == userId);

        if (unreadOnly)
        {
            query = query.Where(n => !n.IsRead);
        }

        query = query.OrderByDescending(n => n.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return Ok(PagedResponse<Notification>.Create(items, pageNumber, pageSize, totalCount, "Notifications retrieved."));
    }

    [HttpGet("unread-count")]
    [HasPermission("Notifications", "Read")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken = default)
    {
        var userId = CurrentUserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.FailureResponse("User ID missing."));
        }

        var count = await _unitOfWork.Repository<Notification>().Query()
            .CountAsync(n => n.UserId == userId && !n.IsRead, cancellationToken);

        return Ok(ApiResponse<int>.SuccessResponse(count, "Unread notification count retrieved."));
    }

    [HttpPost("{id:guid}/read")]
    [HasPermission("Notifications", "Update")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken = default)
    {
        var userId = CurrentUserId;
        var notif = await _unitOfWork.Repository<Notification>().Query()
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId, cancellationToken);

        if (notif == null)
        {
            return NotFound(ApiResponse.FailureResponse("Notification not found."));
        }

        notif.IsRead = true;
        notif.ReadAt = DateTime.UtcNow;
        _unitOfWork.Repository<Notification>().Update(notif);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok(ApiResponse.SuccessResponse("Notification marked as read."));
    }

    [HttpPost("read-all")]
    [HasPermission("Notifications", "Update")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken = default)
    {
        var userId = CurrentUserId;
        var unread = await _unitOfWork.Repository<Notification>().Query()
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
            _unitOfWork.Repository<Notification>().Update(n);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Ok(ApiResponse.SuccessResponse("All notifications marked as read."));
    }
}
