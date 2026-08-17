using AutoMapper;
using ECommerce.Api.Modules.ClientApp.DTOs;
using ECommerce.Api.Modules.ClientApp.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.ClientApp.Services;

public class ClientAddressService : IClientAddressService
{
    private readonly ApplicationDbContext _db;
    private readonly IMapper _mapper;

    public ClientAddressService(ApplicationDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    private async Task<string> ResolveValidUserIdAsync(string userId)
    {
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (userExists)
        {
            return userId;
        }

        var defaultUser = await _db.Users.Select(u => u.Id).FirstOrDefaultAsync();
        return defaultUser ?? userId;
    }

    public async Task<IEnumerable<ClientUserAddressDto>> GetUserAddressesAsync(string userId)
    {
        var validUserId = await ResolveValidUserIdAsync(userId);

        var addresses = await _db.UserAddresses
            .Where(a => a.UserId == validUserId)
            .AsNoTracking()
            .OrderByDescending(a => a.IsDefaultShipping)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();

        return _mapper.Map<IEnumerable<ClientUserAddressDto>>(addresses);
    }

    public async Task<ClientUserAddressDto> CreateUserAddressAsync(string userId, CreateClientUserAddressRequest request)
    {
        var validUserId = await ResolveValidUserIdAsync(userId);

        var address = _mapper.Map<UserAddress>(request);
        address.UserId = validUserId;

        if (request.IsDefaultShipping)
        {
            var existingDefaults = await _db.UserAddresses
                .Where(a => a.UserId == validUserId && a.IsDefaultShipping)
                .ToListAsync();

            foreach (var existing in existingDefaults)
            {
                existing.IsDefaultShipping = false;
            }
        }

        _db.UserAddresses.Add(address);
        await _db.SaveChangesAsync();

        return _mapper.Map<ClientUserAddressDto>(address);
    }
}
