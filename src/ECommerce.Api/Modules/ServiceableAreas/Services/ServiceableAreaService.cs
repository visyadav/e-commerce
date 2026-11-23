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

    public async Task<ServiceableAreaDto> SaveAreaAsync(CreateServiceableAreaRequest request, Guid? id = null)
    {
        ServiceableArea area;

        if (id.HasValue && id.Value != Guid.Empty)
        {
            var existing = await _db.ServiceableAreas.FindAsync(id.Value);
            if (existing != null)
            {
                _mapper.Map(request, existing);
                area = existing;
            }
            else
            {
                area = _mapper.Map<ServiceableArea>(request);
                area.Id = id.Value;
                _db.ServiceableAreas.Add(area);
            }
        }
        else
        {
            area = _mapper.Map<ServiceableArea>(request);
            _db.ServiceableAreas.Add(area);
        }

        await _db.SaveChangesAsync();

        return _mapper.Map<ServiceableAreaDto>(area);
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
                Message = "No delivery cities currently active."
            };
        }

        var requestedCity = request.City?.Trim();
        var requestedPincode = request.Pincode?.Trim();

        // 1. COMPARE CITY NAME ONLY
        bool IsCityMatch(string dbCity, string targetCity)
        {
            if (string.IsNullOrWhiteSpace(dbCity) || string.IsNullOrWhiteSpace(targetCity))
                return false;

            var db = dbCity.Trim().ToLowerInvariant();
            var target = targetCity.Trim().ToLowerInvariant();

            if (db == target || db.Contains(target) || target.Contains(db))
                return true;

            // Region aliases e.g. Noida / Greater Noida / Gautam Buddh Nagar
            if ((db.Contains("noida") || db.Contains("gautam")) &&
                (target.Contains("noida") || target.Contains("gautam")))
                return true;

            return false;
        }

        var cityHubs = activeAreas.Where(a => IsCityMatch(a.City, requestedCity ?? "")).ToList();

        // If City Name does NOT match, return NOT SERVICEABLE immediately (do NOT try to match pincodes)
        if (!cityHubs.Any())
        {
            var availableCities = string.Join(", ", activeAreas.Select(a => a.City.Trim()).Distinct(StringComparer.OrdinalIgnoreCase));
            return new ServiceabilityResultDto
            {
                IsServiceable = false,
                MatchedHubName = null,
                Message = $"Delivery is not available in '{requestedCity ?? "your location"}'. Supported cities: {availableCities}."
            };
        }

        // 2. CITY NAME MATCHED! Now validate EXCLUDE PINCODE ONLY.
        if (!string.IsNullOrWhiteSpace(requestedPincode))
        {
            var excludedPincodes = cityHubs
                .Where(h => !string.IsNullOrWhiteSpace(h.ExcludedPincodes))
                .SelectMany(h => h.ExcludedPincodes!.Split(new[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries))
                .Select(p => p.Trim())
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            if (excludedPincodes.Contains(requestedPincode))
            {
                return new ServiceabilityResultDto
                {
                    IsServiceable = false,
                    MatchedHubName = cityHubs.First().Name,
                    Message = $"Pincode {requestedPincode} in {cityHubs.First().City} is excluded from delivery service. Please change your location."
                };
            }
        }

        // City matched and pincode is NOT in exclude list -> SERVICEABLE!
        var mainHub = cityHubs.First();
        return new ServiceabilityResultDto
        {
            IsServiceable = true,
            MatchedHubName = mainHub.Name,
            Message = $"Delivery available in {mainHub.City}!"
        };
    }
}
