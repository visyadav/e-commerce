using ECommerce.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace ECommerce.Infrastructure.Persistence.Context;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // 1. Determine the path to ECommerce.Api where appsettings.json is located
        var currentDirectory = Directory.GetCurrentDirectory();
        var apiProjectPath = Path.Combine(currentDirectory, "..", "ECommerce.Api");

        // Fallback: If running from the solution root instead of the infrastructure folder
        if (!Directory.Exists(apiProjectPath))
        {
            apiProjectPath = Path.Combine(currentDirectory, "src", "ECommerce.Api");
        }

        if (!Directory.Exists(apiProjectPath))
        {
            throw new DirectoryNotFoundException($"Could not find the ECommerce.Api project directory at '{apiProjectPath}'. Ensure you are running the migration command from either the solution root or the ECommerce.Infrastructure directory.");
        }

        // 2. Load configuration from ECommerce.Api
        var configuration = new ConfigurationBuilder()
            .SetBasePath(apiProjectPath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        // 3. Read DatabaseProvider and connection strings
        var dbProvider = configuration.GetValue<string>("DatabaseProvider") ?? "PostgreSQL";
        var builder = new DbContextOptionsBuilder<ApplicationDbContext>();

        if (dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
        {
            var connectionString = configuration.GetConnectionString("SqlServer") 
                ?? configuration.GetConnectionString("DefaultConnection");
            
            builder.UseSqlServer(connectionString, b => 
                b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
        }
        else
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            
            builder.UseNpgsql(connectionString, b => 
                b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
        }

        return new ApplicationDbContext(builder.Options);
    }
}
