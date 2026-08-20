using ECommerce.Api.Extensions;
using ECommerce.Infrastructure;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add Serilog
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .WriteTo.Console());

// Add Infrastructure & API Services
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

// Seed Database
await app.SeedDatabaseAsync();

// Configure Middleware Pipeline
app.UseApiPipeline(app.Environment);

app.MapControllers();
app.MapHub<ECommerce.Api.Modules.Notifications.Hubs.NotificationHub>("/hubs/notification");

app.Run();

public partial class Program { }
