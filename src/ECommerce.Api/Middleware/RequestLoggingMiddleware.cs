using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace ECommerce.Api.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var request = context.Request;

        _logger.LogInformation("HTTP Request: {Method} {Path} started", request.Method, request.Path);

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            var response = context.Response;
            _logger.LogInformation(
                "HTTP Response: {Method} {Path} responded {StatusCode} in {ElapsedMs} ms",
                request.Method,
                request.Path,
                response.StatusCode,
                stopwatch.ElapsedMilliseconds);
        }
    }
}
