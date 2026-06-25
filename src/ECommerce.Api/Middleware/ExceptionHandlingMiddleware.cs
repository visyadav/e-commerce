using System.Net;
using System.Text.Json;
using ECommerce.Shared.Exceptions;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace ECommerce.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during request processing");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var code = HttpStatusCode.InternalServerError;
        var message = "An internal server error occurred.";
        List<string> errors = [];

        switch (exception)
        {
            case NotFoundException notFoundEx:
                code = HttpStatusCode.NotFound;
                message = notFoundEx.Message;
                break;
            case BadRequestException badRequestEx:
                code = HttpStatusCode.BadRequest;
                message = badRequestEx.Message;
                break;
            case UnauthorizedException unauthorizedEx:
                code = HttpStatusCode.Unauthorized;
                message = unauthorizedEx.Message;
                break;
            case ConflictException conflictEx:
                code = HttpStatusCode.Conflict;
                message = conflictEx.Message;
                break;
            case AppException appEx:
                code = HttpStatusCode.BadRequest;
                message = appEx.Message;
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;

        var response = ApiResponse.FailureResponse(message, errors.Count > 0 ? errors : [exception.Message]);
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var json = JsonSerializer.Serialize(response, options);

        return context.Response.WriteAsync(json);
    }
}
