using AutoMapper;
using ECommerce.Api.Modules.Cart.DTOs;
using ECommerce.Api.Modules.Cart.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Shared.Exceptions;
using ECommerce.Shared.Responses;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Cart.Services;

public class CartService : ICartService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CartService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<CartDto>> GetCartAsync(string userId, CancellationToken cancellationToken = default)
    {
        var cartDto = await GetUserCartDtoAsync(userId, cancellationToken);
        return ApiResponse<CartDto>.SuccessResponse(cartDto, "Cart retrieved successfully.");
    }

    public async Task<ApiResponse<CartDto>> AddToCartAsync(string userId, AddToCartRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            throw new NotFoundException(nameof(Product), request.ProductId);
        }

        // Validate stock quantity
        if (product.StockQuantity < request.Quantity)
        {
            throw new BadRequestException($"Only {product.StockQuantity} items of '{product.Name}' are available in stock.");
        }

        var cartItemRepo = _unitOfWork.Repository<CartItem>();
        var existingItem = await cartItemRepo.Query()
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == request.ProductId, cancellationToken);

        if (existingItem != null)
        {
            var newQuantity = existingItem.Quantity + request.Quantity;
            if (product.StockQuantity < newQuantity)
            {
                throw new BadRequestException($"Cannot add {request.Quantity} more items. Only {product.StockQuantity} items of '{product.Name}' are available in stock, and you already have {existingItem.Quantity} in your cart.");
            }

            existingItem.Quantity = newQuantity;
            cartItemRepo.Update(existingItem);
        }
        else
        {
            var newItem = new CartItem
            {
                UserId = userId,
                ProductId = request.ProductId,
                Quantity = request.Quantity
            };
            await cartItemRepo.AddAsync(newItem, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var cartDto = await GetUserCartDtoAsync(userId, cancellationToken);
        return ApiResponse<CartDto>.SuccessResponse(cartDto, "Item added to cart successfully.");
    }

    public async Task<ApiResponse<CartDto>> UpdateQuantityAsync(string userId, Guid cartItemId, int quantity, CancellationToken cancellationToken = default)
    {
        var cartItemRepo = _unitOfWork.Repository<CartItem>();
        var item = await cartItemRepo.Query()
            .Include(c => c.Product)
            .FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId, cancellationToken);

        if (item == null)
        {
            throw new NotFoundException(nameof(CartItem), cartItemId);
        }

        // Validate stock levels
        if (item.Product.StockQuantity < quantity)
        {
            throw new BadRequestException($"Only {item.Product.StockQuantity} items of '{item.Product.Name}' are available in stock.");
        }

        item.Quantity = quantity;
        cartItemRepo.Update(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var cartDto = await GetUserCartDtoAsync(userId, cancellationToken);
        return ApiResponse<CartDto>.SuccessResponse(cartDto, "Cart item quantity updated successfully.");
    }

    public async Task<ApiResponse<CartDto>> RemoveFromCartAsync(string userId, Guid cartItemId, CancellationToken cancellationToken = default)
    {
        var cartItemRepo = _unitOfWork.Repository<CartItem>();
        var item = await cartItemRepo.Query()
            .FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId, cancellationToken);

        if (item == null)
        {
            throw new NotFoundException(nameof(CartItem), cartItemId);
        }

        cartItemRepo.Remove(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var cartDto = await GetUserCartDtoAsync(userId, cancellationToken);
        return ApiResponse<CartDto>.SuccessResponse(cartDto, "Item removed from cart successfully.");
    }

    public async Task<ApiResponse> ClearCartAsync(string userId, CancellationToken cancellationToken = default)
    {
        var cartItemRepo = _unitOfWork.Repository<CartItem>();
        var items = await cartItemRepo.FindAsync(c => c.UserId == userId);

        cartItemRepo.RemoveRange(items);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse.SuccessResponse("Cart cleared successfully.");
    }

    private async Task<CartDto> GetUserCartDtoAsync(string userId, CancellationToken cancellationToken)
    {
        var items = await _unitOfWork.Repository<CartItem>().Query()
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .ToListAsync(cancellationToken);

        var itemDtos = _mapper.Map<List<CartItemDto>>(items);
        var subTotal = itemDtos.Sum(i => i.TotalPrice);
        var totalItems = itemDtos.Sum(i => i.Quantity);

        return new CartDto
        {
            Items = itemDtos,
            SubTotal = subTotal,
            TotalItems = totalItems
        };
    }
}
