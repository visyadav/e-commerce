using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace ECommerce.Api.Filters;

public class LoggingActionFilter : IActionFilter
{
    private readonly ILogger<LoggingActionFilter> _logger;

    public LoggingActionFilter(ILogger<LoggingActionFilter> logger)
    {
        _logger = logger;
    }

    public void OnActionExecuting(ActionExecutingContext context)
    {
        var actionName = context.ActionDescriptor.DisplayName;
        
        // Log action arguments, safely converting to JSON where possible
        if (context.ActionArguments.Any())
        {
            try
            {
                var args = JsonSerializer.Serialize(context.ActionArguments);
                _logger.LogInformation("Executing {ActionName} with arguments: {Arguments}", actionName, args);
            }
            catch
            {
                _logger.LogInformation("Executing {ActionName} with un-serializable arguments", actionName);
            }
        }
        else
        {
            _logger.LogInformation("Executing {ActionName} with no arguments", actionName);
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        var actionName = context.ActionDescriptor.DisplayName;

        if (context.Exception != null)
        {
            _logger.LogError(context.Exception, "Error executing {ActionName}", actionName);
        }
        else
        {
            _logger.LogInformation("Successfully executed {ActionName}", actionName);
        }
    }
}
