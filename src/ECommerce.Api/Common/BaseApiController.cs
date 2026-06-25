using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Common;

[ApiController]
[Route("api/v1/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);
    protected string? CurrentUserEmail => User.FindFirstValue(ClaimTypes.Email);
    protected IEnumerable<string> CurrentUserRoles => User.FindAll(ClaimTypes.Role).Select(c => c.Value);
}
