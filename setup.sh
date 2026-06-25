#!/bin/bash
set -e

echo "🚀 Setting up E-Commerce Modular Monolith..."
echo "dotnet version: $(dotnet --version)"

# Create solution
dotnet new sln -n ECommerce --force

# Create projects
dotnet new webapi -n ECommerce.Api -o src/ECommerce.Api --use-controllers
dotnet new classlib -n ECommerce.Domain -o src/ECommerce.Domain
dotnet new classlib -n ECommerce.Infrastructure -o src/ECommerce.Infrastructure
dotnet new classlib -n ECommerce.Shared -o src/ECommerce.Shared
dotnet new xunit -n ECommerce.UnitTests -o tests/ECommerce.UnitTests
dotnet new xunit -n ECommerce.IntegrationTests -o tests/ECommerce.IntegrationTests

# Add to solution
dotnet sln add src/ECommerce.Api/ECommerce.Api.csproj
dotnet sln add src/ECommerce.Domain/ECommerce.Domain.csproj
dotnet sln add src/ECommerce.Infrastructure/ECommerce.Infrastructure.csproj
dotnet sln add src/ECommerce.Shared/ECommerce.Shared.csproj
dotnet sln add tests/ECommerce.UnitTests/ECommerce.UnitTests.csproj
dotnet sln add tests/ECommerce.IntegrationTests/ECommerce.IntegrationTests.csproj

# Add project references
dotnet add src/ECommerce.Api/ECommerce.Api.csproj reference \
  src/ECommerce.Infrastructure/ECommerce.Infrastructure.csproj \
  src/ECommerce.Shared/ECommerce.Shared.csproj

dotnet add src/ECommerce.Infrastructure/ECommerce.Infrastructure.csproj reference \
  src/ECommerce.Domain/ECommerce.Domain.csproj \
  src/ECommerce.Shared/ECommerce.Shared.csproj

dotnet add tests/ECommerce.UnitTests/ECommerce.UnitTests.csproj reference \
  src/ECommerce.Api/ECommerce.Api.csproj \
  src/ECommerce.Domain/ECommerce.Domain.csproj \
  src/ECommerce.Infrastructure/ECommerce.Infrastructure.csproj \
  src/ECommerce.Shared/ECommerce.Shared.csproj

dotnet add tests/ECommerce.IntegrationTests/ECommerce.IntegrationTests.csproj reference \
  src/ECommerce.Api/ECommerce.Api.csproj

echo "📦 Adding NuGet packages..."

# Api packages
dotnet add src/ECommerce.Api package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add src/ECommerce.Api package Swashbuckle.AspNetCore
dotnet add src/ECommerce.Api package Serilog.AspNetCore
dotnet add src/ECommerce.Api package Serilog.Sinks.Console
dotnet add src/ECommerce.Api package Serilog.Sinks.File
dotnet add src/ECommerce.Api package FluentValidation
dotnet add src/ECommerce.Api package FluentValidation.DependencyInjectionExtensions
dotnet add src/ECommerce.Api package AutoMapper

# Domain packages
dotnet add src/ECommerce.Domain package Microsoft.Extensions.Identity.Stores

# Infrastructure packages
dotnet add src/ECommerce.Infrastructure package Microsoft.EntityFrameworkCore
dotnet add src/ECommerce.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add src/ECommerce.Infrastructure package Microsoft.EntityFrameworkCore.SqlServer
dotnet add src/ECommerce.Infrastructure package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add src/ECommerce.Infrastructure package Microsoft.EntityFrameworkCore.Tools
dotnet add src/ECommerce.Infrastructure package System.IdentityModel.Tokens.Jwt
dotnet add src/ECommerce.Infrastructure package Microsoft.Extensions.Caching.StackExchangeRedis
dotnet add src/ECommerce.Infrastructure package Hangfire.Core

# Test packages
dotnet add tests/ECommerce.UnitTests package Moq
dotnet add tests/ECommerce.UnitTests package FluentAssertions
dotnet add tests/ECommerce.IntegrationTests package Microsoft.AspNetCore.Mvc.Testing
dotnet add tests/ECommerce.IntegrationTests package FluentAssertions

echo "🧹 Cleaning template files..."
rm -f src/ECommerce.Domain/Class1.cs
rm -f src/ECommerce.Infrastructure/Class1.cs
rm -f src/ECommerce.Shared/Class1.cs
rm -f src/ECommerce.Api/Controllers/WeatherForecastController.cs 2>/dev/null || true
rm -f src/ECommerce.Api/WeatherForecast.cs 2>/dev/null || true
rm -f tests/ECommerce.UnitTests/UnitTest1.cs 2>/dev/null || true
rm -f tests/ECommerce.IntegrationTests/UnitTest1.cs 2>/dev/null || true

echo "📁 Creating directory structure..."

# Api directories
mkdir -p src/ECommerce.Api/{Configurations,Extensions,Middleware,Filters,Common,Properties}
mkdir -p src/ECommerce.Api/Modules/Authentication/{Controllers,Commands,Services,Interfaces,DTOs,Validators,Mappings}
mkdir -p src/ECommerce.Api/Modules/Users
mkdir -p src/ECommerce.Api/Modules/Catalog/Products/{Controllers,Commands,Queries,Services,Interfaces,DTOs,Validators,Mappings,Specifications}
mkdir -p src/ECommerce.Api/Modules/Catalog/Categories
mkdir -p src/ECommerce.Api/Modules/Catalog/Brands
mkdir -p src/ECommerce.Api/Modules/Inventory
mkdir -p src/ECommerce.Api/Modules/Cart
mkdir -p src/ECommerce.Api/Modules/Wishlist
mkdir -p src/ECommerce.Api/Modules/Orders
mkdir -p src/ECommerce.Api/Modules/Payments
mkdir -p src/ECommerce.Api/Modules/Coupons
mkdir -p src/ECommerce.Api/Modules/Reviews
mkdir -p src/ECommerce.Api/Modules/Notifications
mkdir -p src/ECommerce.Api/Modules/Dashboard
mkdir -p src/ECommerce.Api/Modules/Admin
mkdir -p src/ECommerce.Api/Modules/Navigation/{Controllers,Services,Interfaces,DTOs,Mappings}

# Domain directories
mkdir -p src/ECommerce.Domain/{Common,Entities,Enums,Events,ValueObjects,Interfaces}

# Infrastructure directories
mkdir -p src/ECommerce.Infrastructure/Persistence/{Context,Configurations,Repositories,Seed}
mkdir -p src/ECommerce.Infrastructure/{Identity,Caching,Storage,Logging,Email,BackgroundJobs,Payment}

# Shared directories
mkdir -p src/ECommerce.Shared/{Responses,Exceptions,Utilities,Extensions,Pagination,Constants,Helpers}

echo "✅ Solution structure created successfully!"
