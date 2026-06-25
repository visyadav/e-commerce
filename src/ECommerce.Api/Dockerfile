FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy project files for restoring
COPY ["src/ECommerce.Api/ECommerce.Api.csproj", "src/ECommerce.Api/"]
COPY ["src/ECommerce.Infrastructure/ECommerce.Infrastructure.csproj", "src/ECommerce.Infrastructure/"]
COPY ["src/ECommerce.Domain/ECommerce.Domain.csproj", "src/ECommerce.Domain/"]
COPY ["src/ECommerce.Shared/ECommerce.Shared.csproj", "src/ECommerce.Shared/"]

# Restore dependencies
RUN dotnet restore "./src/ECommerce.Api/ECommerce.Api.csproj"

# Copy all source files and build
COPY . .
WORKDIR "/src/src/ECommerce.Api"
RUN dotnet build "./ECommerce.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish the application
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./ECommerce.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final stage - runtime
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ECommerce.Api.dll"]
