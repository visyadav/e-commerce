using AutoMapper;
using ECommerce.Api.Modules.Users.DTOs;
using ECommerce.Api.Modules.Users.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Exceptions;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Users.Services;

public class ProfileService : IProfileService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProfileService(
        UserManager<ApplicationUser> userManager,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _userManager = userManager;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<UserProfileDto>> GetProfileAsync(string userId)
    {
        var user = await _userManager.Users
            .Include(u => u.SavedAddresses)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new NotFoundException(nameof(ApplicationUser), userId);
        }

        var dto = _mapper.Map<UserProfileDto>(user);
        return ApiResponse<UserProfileDto>.SuccessResponse(dto, "Profile retrieved successfully.");
    }

    public async Task<ApiResponse<UserProfileDto>> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException(nameof(ApplicationUser), userId);
        }

        // Email uniqueness verification
        if (!string.IsNullOrWhiteSpace(request.Email) && !string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase))
        {
            var existingWithEmail = await _userManager.FindByEmailAsync(request.Email);
            if (existingWithEmail != null && existingWithEmail.Id != userId)
            {
                throw new BadRequestException("Email address is already in use.");
            }

            user.Email = request.Email;
            user.UserName = request.Email;
        }

        if (!string.IsNullOrWhiteSpace(request.FirstName))
        {
            user.FirstName = request.FirstName;
        }

        if (!string.IsNullOrWhiteSpace(request.LastName))
        {
            user.LastName = request.LastName;
        }

        if (request.PhoneNumber != null)
        {
            user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber;
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            throw new BadRequestException($"Failed to update profile: {string.Join(", ", errors)}");
        }

        // Load complete updated user profile with addresses
        return await GetProfileAsync(userId);
    }

    public async Task<ApiResponse<List<UserAddressDto>>> GetAddressesAsync(string userId)
    {
        var addresses = await _unitOfWork.Repository<UserAddress>().Query()
            .Where(a => a.UserId == userId)
            .ToListAsync();

        var dtos = _mapper.Map<List<UserAddressDto>>(addresses);
        return ApiResponse<List<UserAddressDto>>.SuccessResponse(dtos, "Saved addresses retrieved successfully.");
    }

    public async Task<ApiResponse<UserAddressDto>> AddAddressAsync(string userId, CreateUserAddressRequest request)
    {
        var addressRepo = _unitOfWork.Repository<UserAddress>();

        // Handle default reset logic
        if (request.IsDefaultShipping)
        {
            await ResetOtherDefaultShippingAddressesAsync(userId);
        }

        if (request.IsDefaultBilling)
        {
            await ResetOtherDefaultBillingAddressesAsync(userId);
        }

        var newAddress = _mapper.Map<UserAddress>(request);
        newAddress.UserId = userId;

        await addressRepo.AddAsync(newAddress);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<UserAddressDto>(newAddress);
        return ApiResponse<UserAddressDto>.SuccessResponse(dto, "Address added successfully.");
    }

    public async Task<ApiResponse<UserAddressDto>> UpdateAddressAsync(string userId, Guid addressId, UpdateUserAddressRequest request)
    {
        var addressRepo = _unitOfWork.Repository<UserAddress>();
        var address = await addressRepo.Query()
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

        if (address == null)
        {
            throw new NotFoundException(nameof(UserAddress), addressId);
        }

        // Handle default reset logic
        if (request.IsDefaultShipping && !address.IsDefaultShipping)
        {
            await ResetOtherDefaultShippingAddressesAsync(userId);
        }

        if (request.IsDefaultBilling && !address.IsDefaultBilling)
        {
            await ResetOtherDefaultBillingAddressesAsync(userId);
        }

        _mapper.Map(request, address);
        addressRepo.Update(address);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<UserAddressDto>(address);
        return ApiResponse<UserAddressDto>.SuccessResponse(dto, "Address updated successfully.");
    }

    public async Task<ApiResponse> DeleteAddressAsync(string userId, Guid addressId)
    {
        var addressRepo = _unitOfWork.Repository<UserAddress>();
        var address = await addressRepo.Query()
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

        if (address == null)
        {
            throw new NotFoundException(nameof(UserAddress), addressId);
        }

        addressRepo.Remove(address);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse.SuccessResponse("Address deleted successfully.");
    }

    private async Task ResetOtherDefaultShippingAddressesAsync(string userId)
    {
        var addressRepo = _unitOfWork.Repository<UserAddress>();
        var defaults = await addressRepo.FindAsync(a => a.UserId == userId && a.IsDefaultShipping);
        foreach (var addr in defaults)
        {
            addr.IsDefaultShipping = false;
            addressRepo.Update(addr);
        }
    }

    private async Task ResetOtherDefaultBillingAddressesAsync(string userId)
    {
        var addressRepo = _unitOfWork.Repository<UserAddress>();
        var defaults = await addressRepo.FindAsync(a => a.UserId == userId && a.IsDefaultBilling);
        foreach (var addr in defaults)
        {
            addr.IsDefaultBilling = false;
            addressRepo.Update(addr);
        }
    }
}
