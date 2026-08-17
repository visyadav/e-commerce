using AutoMapper;
using ECommerce.Api.Modules.ServiceableAreas.DTOs;
using ECommerce.Api.Modules.ServiceableAreas.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.ServiceableAreas.Services;

public class ServiceableAreaService : IServiceableAreaService
{
    private readonly ApplicationDbContext _db;
    private readonly IMapper _mapper;

    public ServiceableAreaService(ApplicationDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ServiceableAreaDto>> GetAllAreasAsync()
    {
        var areas = await _db.ServiceableAreas
            .AsNoTracking()
            .OrderByDescending(a => a.IsActive)
            .ThenBy(a => a.Name)
            .ToListAsync();

        return _mapper.Map<IEnumerable<ServiceableAreaDto>>(areas);
    }

    public async Task<ServiceableAreaDto?> GetAreaByIdAsync(Guid id)
    {
        var area = await _db.ServiceableAreas.FindAsync(id);
        return area == null ? null : _mapper.Map<ServiceableAreaDto>(area);
    }

    public async Task<ServiceableAreaDto> CreateAreaAsync(CreateServiceableAreaRequest request)
    {
        var area = _mapper.Map<ServiceableArea>(request);

        _db.ServiceableAreas.Add(area);
        await _db.SaveChangesAsync();

        return _mapper.Map<ServiceableAreaDto>(area);
    }

    public async Task<ServiceableAreaDto?> UpdateAreaAsync(Guid id, UpdateServiceableAreaRequest request)
    {
        var area = await _db.ServiceableAreas.FindAsync(id);
        if (area == null) return null;

        _mapper.Map(request, area);

        await _db.SaveChangesAsync();

        return _mapper.Map<ServiceableAreaDto>(area);
    }

    public async Task<bool> DeleteAreaAsync(Guid id)
    {
        var area = await _db.ServiceableAreas.FindAsync(id);
        if (area == null) return false;

        _db.ServiceableAreas.Remove(area);
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<ServiceabilityResultDto> CheckServiceabilityAsync(CheckServiceabilityRequest request)
    {
        var activeAreas = await _db.ServiceableAreas
            .Where(a => a.IsActive)
            .AsNoTracking()
            .ToListAsync();

        if (!activeAreas.Any())
        {
            return new ServiceabilityResultDto
            {
                IsServiceable = false,
                Message = "No delivery hubs currently active."
            };
        }

        // 1. If GPS coordinates are provided, perform Haversine distance calculation
        if (request.Latitude.HasValue && request.Longitude.HasValue)
        {
            foreach (var area in activeAreas)
            {
                var distance = CalculateDistanceInKm(
                    request.Latitude.Value,
                    request.Longitude.Value,
                    area.Latitude,
                    area.Longitude
                );

                if (distance <= area.RadiusInKm)
                {
                    return new ServiceabilityResultDto
                    {
                        IsServiceable = true,
                        MatchedHubName = area.Name,
                        DistanceInKm = Math.Round(distance, 2),
                        AllowedRadiusKm = area.RadiusInKm,
                        Message = $"Delivery available! Your location is {Math.Round(distance, 1)} km from {area.Name}."
                    };
                }
            }

            // Calculate nearest hub distance for error response
            var nearest = activeAreas
                .Select(a => new
                {
                    Area = a,
                    Dist = CalculateDistanceInKm(request.Latitude.Value, request.Longitude.Value, a.Latitude, a.Longitude)
                })
                .OrderBy(x => x.Dist)
                .First();

            return new ServiceabilityResultDto
            {
                IsServiceable = false,
                MatchedHubName = nearest.Area.Name,
                DistanceInKm = Math.Round(nearest.Dist, 2),
                AllowedRadiusKm = nearest.Area.RadiusInKm,
                Message = $"Location is {Math.Round(nearest.Dist, 1)} km away from {nearest.Area.Name} (Max radius: {nearest.Area.RadiusInKm} km). CookSafari does not deliver here yet."
            };
        }

        // 2. Fallback to Sector Name or Pincode matching if GPS coordinates are missing
        if (!string.IsNullOrWhiteSpace(request.SectorOrAddress) || !string.IsNullOrWhiteSpace(request.Pincode))
        {
            var match = activeAreas.FirstOrDefault(a =>
                (!string.IsNullOrEmpty(request.Pincode) && a.Pincode == request.Pincode) ||
                (!string.IsNullOrEmpty(request.SectorOrAddress) &&
                 (request.SectorOrAddress.Contains("62") || a.Name.Contains(request.SectorOrAddress, StringComparison.OrdinalIgnoreCase)))
            );

            if (match != null)
            {
                return new ServiceabilityResultDto
                {
                    IsServiceable = true,
                    MatchedHubName = match.Name,
                    AllowedRadiusKm = match.RadiusInKm,
                    Message = $"Delivery available at {match.Name}!"
                };
            }
        }

        return new ServiceabilityResultDto
        {
            IsServiceable = false,
            Message = "Location outside CookSafari delivery zone. We currently deliver to Sector 62, Noida."
        };
    }

    public static double CalculateDistanceInKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double r = 6371.0; // Radius of the Earth in km
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return r * c;
    }

    private static double ToRadians(double angle) => (Math.PI / 180.0) * angle;
}
