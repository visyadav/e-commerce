using ECommerce.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ECommerce.Infrastructure.Email;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly EmailSettings _emailSettings;

    public EmailService(ILogger<EmailService> logger, IOptions<EmailSettings> emailSettings)
    {
        _logger = logger;
        _emailSettings = emailSettings.Value;
    }

    public Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "✉️ Sending Email:\n" +
            "  From: {FromName} <{FromEmail}>\n" +
            "  To: {To}\n" +
            "  Subject: {Subject}\n" +
            "  Body: {Body}",
            _emailSettings.FromName, _emailSettings.FromEmail, to, subject, body);

        return Task.CompletedTask;
    }
}
