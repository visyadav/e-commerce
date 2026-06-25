namespace ECommerce.Shared.Exceptions;

public class NotFoundException : AppException
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} with key '{key}' was not found.", 404)
    {
    }

    public NotFoundException(string message)
        : base(message, 404)
    {
    }
}
