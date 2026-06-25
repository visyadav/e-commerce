namespace ECommerce.Infrastructure.BackgroundJobs;

public class HangfireConfiguration
{
    public bool Enabled { get; set; }
    public string DashboardPath { get; set; } = "/hangfire";
}
