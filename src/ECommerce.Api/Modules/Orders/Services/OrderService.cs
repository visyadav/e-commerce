using System.Linq;
using AutoMapper;
using ECommerce.Api.Modules.Inventory.Interfaces;
using ECommerce.Api.Modules.Orders.DTOs;
using ECommerce.Api.Modules.Orders.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using ECommerce.Domain.ValueObjects;
using ECommerce.Shared.Exceptions;
using ECommerce.Shared.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Modules.Orders.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IInventoryService _inventoryService;
    private readonly IEmailService _emailService;
    private readonly UserManager<ApplicationUser> _userManager;

    public OrderService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IInventoryService inventoryService,
        IEmailService emailService,
        UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _inventoryService = inventoryService;
        _emailService = emailService;
        _userManager = userManager;
    }

    public async Task<ApiResponse<OrderDto>> CheckoutAsync(string userId, CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        // 1. Fetch active Cart items for User
        var cartItems = await _unitOfWork.Repository<CartItem>().Query()
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .ToListAsync(cancellationToken);

        if (cartItems.Count == 0)
        {
            throw new BadRequestException("Your shopping cart is empty.");
        }

        // 2. Stock levels verification
        var outOfStockItems = cartItems
            .Where(ci => ci.Product.StockQuantity < ci.Quantity)
            .Select(ci => ci.Product.Name)
            .ToList();

        if (outOfStockItems.Any())
        {
            throw new BadRequestException($"The following products in your cart do not have enough stock: {string.Join(", ", outOfStockItems)}. Please adjust your cart quantity.");
        }

        // 3. Address mappings
        Address shippingAddress;
        if (request.ShippingAddressId.HasValue)
        {
            var savedAddr = await _unitOfWork.Repository<UserAddress>().Query()
                .FirstOrDefaultAsync(a => a.Id == request.ShippingAddressId.Value && a.UserId == userId, cancellationToken);
            if (savedAddr == null)
            {
                throw new BadRequestException("Specified saved shipping address not found.");
            }
            shippingAddress = new Address
            {
                Street = savedAddr.Street,
                City = savedAddr.City,
                State = savedAddr.State,
                Country = savedAddr.Country,
                ZipCode = savedAddr.ZipCode,
                Phone = savedAddr.Phone
            };
        }
        else if (request.ShippingAddress != null)
        {
            shippingAddress = _mapper.Map<Address>(request.ShippingAddress);
        }
        else
        {
            throw new BadRequestException("Shipping address is required.");
        }

        Address billingAddress;
        if (request.BillingAddressId.HasValue)
        {
            var savedAddr = await _unitOfWork.Repository<UserAddress>().Query()
                .FirstOrDefaultAsync(a => a.Id == request.BillingAddressId.Value && a.UserId == userId, cancellationToken);
            if (savedAddr == null)
            {
                throw new BadRequestException("Specified saved billing address not found.");
            }
            billingAddress = new Address
            {
                Street = savedAddr.Street,
                City = savedAddr.City,
                State = savedAddr.State,
                Country = savedAddr.Country,
                ZipCode = savedAddr.ZipCode,
                Phone = savedAddr.Phone
            };
        }
        else if (request.BillingAddress != null)
        {
            billingAddress = _mapper.Map<Address>(request.BillingAddress);
        }
        else
        {
            throw new BadRequestException("Billing address is required.");
        }

        // 4. Calculations
        var subTotal = cartItems.Sum(ci => ci.Quantity * ci.Product.Price);
        var taxAmount = subTotal * 0.10m; // 10% tax
        var shippingAmount = subTotal >= 150m ? 0m : 20m; // Free shipping over 150, else 20
        var totalAmount = subTotal + taxAmount + shippingAmount;

        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpperInvariant()}";

        // 5. Begin Transaction
        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            var order = new Order
            {
                OrderNumber = orderNumber,
                UserId = userId,
                SubTotal = subTotal,
                TaxAmount = taxAmount,
                ShippingAmount = shippingAmount,
                TotalAmount = totalAmount,
                Notes = request.Notes,
                ShippingAddress = shippingAddress,
                BillingAddress = billingAddress,
                Status = OrderStatus.Pending
            };

            await _unitOfWork.Repository<Order>().AddAsync(order, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            foreach (var ci in cartItems)
            {
                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = ci.ProductId,
                    ProductName = ci.Product.Name,
                    ProductSku = ci.Product.Sku,
                    ProductImageUrl = ci.Product.Images?.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault(),
                    Quantity = ci.Quantity,
                    UnitPrice = ci.Product.Price,
                    TotalPrice = ci.Product.Price * ci.Quantity,
                    Order = order,
                    Product = ci.Product
                };

                await _unitOfWork.Repository<OrderItem>().AddAsync(orderItem, cancellationToken);

                // Deduct stock via inventory service (applying concurrency retries)
                await _inventoryService.DeductStockInternalAsync(ci.ProductId, ci.Quantity, orderNumber, cancellationToken);
            }

            // 6. Clear shopping cart
            var cartRepo = _unitOfWork.Repository<CartItem>();
            cartRepo.RemoveRange(cartItems);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            // Fetch user email for confirmation
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null && !string.IsNullOrEmpty(user.Email))
            {
                try
                {
                    await _emailService.SendEmailAsync(
                        user.Email,
                        $"Order Confirmation - {orderNumber}",
                        $"Hi {user.FullName},\n\nThank you for your order! Your order {orderNumber} has been placed successfully.\nTotal Amount: {totalAmount:C}.\n\nTeam ECommerce");
                }
                catch
                {
                    // Do not fail checkout flow if email service throws an error
                }
            }

            var dto = _mapper.Map<OrderDto>(order);
            return ApiResponse<OrderDto>.SuccessResponse(dto, "Order placed successfully.");
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }

    public async Task<ApiResponse<OrderDto>> GetOrderByIdAsync(Guid orderId, string userId, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Repository<Order>().Query()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId, cancellationToken);

        if (order == null)
        {
            throw new NotFoundException(nameof(Order), orderId);
        }

        var dto = _mapper.Map<OrderDto>(order);
        return ApiResponse<OrderDto>.SuccessResponse(dto, "Order retrieved successfully.");
    }

    public async Task<PagedResponse<OrderDto>> GetMyOrdersAsync(string userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Repository<Order>().Query()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<OrderDto>>(items);
        return PagedResponse<OrderDto>.Create(dtos, pageNumber, pageSize, totalCount, "Customer orders retrieved successfully.");
    }
}
