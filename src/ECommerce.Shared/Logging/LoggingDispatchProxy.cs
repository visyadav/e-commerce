using System.Reflection;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace ECommerce.Shared.Logging;

public class LoggingDispatchProxy : DispatchProxy
{
    private object _target = null!;
    private ILogger _logger = null!;

    protected override object? Invoke(MethodInfo? targetMethod, object?[]? args)
    {
        if (targetMethod == null) return null;

        var methodName = targetMethod.Name;
        var className = _target.GetType().Name;

        try
        {
            var argsJson = args != null && args.Length > 0 ? JsonSerializer.Serialize(args) : "[]";
            _logger.LogInformation("Entering {ClassName}.{MethodName} with arguments {Arguments}", className, methodName, argsJson);
        }
        catch
        {
            _logger.LogInformation("Entering {ClassName}.{MethodName}", className, methodName);
        }

        try
        {
            var result = targetMethod.Invoke(_target, args);
            
            // Note: If result is a Task, we could ideally await it and log the result, 
            // but for simplicity in a synchronous DispatchProxy we log successful invocation start/return.
            _logger.LogInformation("Successfully executed {ClassName}.{MethodName}", className, methodName);
            
            return result;
        }
        catch (TargetInvocationException ex)
        {
            _logger.LogError(ex.InnerException ?? ex, "Error executing {ClassName}.{MethodName}", className, methodName);
            throw ex.InnerException ?? ex;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing {ClassName}.{MethodName}", className, methodName);
            throw;
        }
    }

    public static TDecorated Create<TDecorated>(TDecorated target, ILogger logger) where TDecorated : class
    {
        object proxy = Create<TDecorated, LoggingDispatchProxy>();
        ((LoggingDispatchProxy)proxy).SetParameters(target, logger);
        return (TDecorated)proxy;
    }

    private void SetParameters(object target, ILogger logger)
    {
        _target = target ?? throw new ArgumentNullException(nameof(target));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
}
