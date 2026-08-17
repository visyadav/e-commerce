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
                Message = "No delivery hubs currently active."
            };
        }

        var requestedPincode = request.Pincode?.Trim();

        // Pure Pincode Match: If requested pincode is in active service pincodes -> Available, otherwise Not Available
        if (!string.IsNullOrWhiteSpace(requestedPincode))
        {
            var match = activeAreas.FirstOrDefault(a =>
                string.Equals(a.Pincode.Trim(), requestedPincode, StringComparison.OrdinalIgnoreCase));

            if (match != null)
            {
                return new ServiceabilityResultDto
                {
                    IsServiceable = true,
                    MatchedHubName = match.Name,
                    AllowedRadiusKm = 0,
                    DistanceInKm = 0,
                    Message = $"Delivery available in {match.City}! Pincode {match.Pincode} is serviceable ({match.Name})."
                };
            }

            var activePincodesList = string.Join(", ", activeAreas.Select(a => a.Pincode.Trim()).Distinct());
            return new ServiceabilityResultDto
            {
                IsServiceable = false,
                MatchedHubName = null,
                AllowedRadiusKm = 0,
                DistanceInKm = 0,
                Message = $"CookSafari does not deliver to pincode {requestedPincode} yet. Active delivery pincodes: {activePincodesList}."
            };
        }

        return new ServiceabilityResultDto
        {
            IsServiceable = false,
            MatchedHubName = null,
            AllowedRadiusKm = 0,
            DistanceInKm = 0,
            Message = "Please enter or select a valid 6-digit pincode to check delivery availability."
        };
    }
}
