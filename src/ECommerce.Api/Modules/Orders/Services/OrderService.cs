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
    private readonly ILogger<OrderService> _logger;

    public OrderService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IInventoryService inventoryService,
        IEmailService emailService,
        UserManager<ApplicationUser> userManager,
        ILogger<OrderService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _inventoryService = inventoryService;
        _emailService = emailService;
        _userManager = userManager;
        _logger = logger;
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
            if (savedAddr != null)
            {
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
            else
            {
                shippingAddress = request.ShippingAddress != null
                    ? _mapper.Map<Address>(request.ShippingAddress)
                    : new Address { Street = "Local Delivery Address", City = "City", State = "State", Country = "India", ZipCode = "100001", Phone = "9999999999" };
            }
        }
        else if (request.ShippingAddress != null)
        {
            shippingAddress = _mapper.Map<Address>(request.ShippingAddress);
        }
        else
        {
            var userSavedAddr = await _unitOfWork.Repository<UserAddress>().Query()
                .FirstOrDefaultAsync(a => a.UserId == userId && a.IsDefaultShipping, cancellationToken);
            if (userSavedAddr != null)
            {
                shippingAddress = new Address
                {
                    Street = userSavedAddr.Street,
                    City = userSavedAddr.City,
                    State = userSavedAddr.State,
                    Country = userSavedAddr.Country,
                    ZipCode = userSavedAddr.ZipCode,
                    Phone = userSavedAddr.Phone
                };
            }
            else
            {
                shippingAddress = new Address
                {
                    Street = "Main Street, Sector 15",
                    City = "New Delhi",
                    State = "Delhi",
                    Country = "India",
                    ZipCode = "110001",
                    Phone = "9876543210"
                };
            }
        }

        Address billingAddress = request.BillingAddress != null
            ? _mapper.Map<Address>(request.BillingAddress)
            : new Address
            {
                Street = shippingAddress.Street,
                City = shippingAddress.City,
                State = shippingAddress.State,
                Country = shippingAddress.Country,
                ZipCode = shippingAddress.ZipCode,
                Phone = shippingAddress.Phone
            };

        // 4. Coupon validation and discount calculation
        decimal discountAmount = 0m;
        Coupon? appliedCoupon = null;

        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var codeClean = request.CouponCode.Trim().ToLower();
            var coupon = await _unitOfWork.Repository<Coupon>().Query()
                .Include(c => c.Product)
                .Include(c => c.Category)
                .FirstOrDefaultAsync(c => c.Code.ToLower() == codeClean && c.IsActive && !c.IsDeleted, cancellationToken);

            if (coupon != null)
            {
                var now = DateTime.UtcNow;
                bool isValid = now >= coupon.StartDate && now <= coupon.EndDate && coupon.CurrentUsageCount < coupon.MaxUsageCount;

                if (isValid)
                {
                    var userUsageCount = await _unitOfWork.Repository<CouponUsageLog>().Query()
                        .CountAsync(l => l.CouponId == coupon.Id && l.UserId == userId, cancellationToken);

                    if (userUsageCount < coupon.MaxUsagePerUser)
                    {
                        // Calculate standard non-discounted products subtotal (Rule #6)
                        var standardItemsSubtotal = cartItems
                            .Where(ci => ci.Product.CompareAtPrice == null || ci.Product.CompareAtPrice <= ci.Product.Price)
                            .Sum(ci => ci.Quantity * ci.Product.Price);

                        if (standardItemsSubtotal >= coupon.MinOrderAmount)
                        {
                            var calcDiscount = (standardItemsSubtotal * coupon.DiscountPercentage) / 100m;
                            if (coupon.MaxDiscountAmount.HasValue && coupon.MaxDiscountAmount.Value > 0)
                            {
                                calcDiscount = Math.Min(calcDiscount, coupon.MaxDiscountAmount.Value);
                            }
                            discountAmount = calcDiscount;
                            appliedCoupon = coupon;
                        }
                    }
                }
            }
        }

        // 5. Pricing calculations
        var subTotal = cartItems.Sum(ci => ci.Quantity * ci.Product.Price);
        var taxAmount = 0m;
        var shippingAmount = subTotal >= 300m ? 0m : 25m;
        var totalAmount = Math.Max(0m, subTotal + shippingAmount - discountAmount);

        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpperInvariant()}";

        // 6. Execute Order Placement in Single Atomic Batch Transaction
        try
        {
            var order = new Order
            {
                OrderNumber = orderNumber,
                UserId = userId,
                SubTotal = subTotal,
                TaxAmount = taxAmount,
                ShippingAmount = shippingAmount,
                DiscountAmount = discountAmount,
                TotalAmount = totalAmount,
                CouponCode = appliedCoupon?.Code,
                CouponId = appliedCoupon?.Id,
                Notes = request.Notes,
                ShippingAddress = shippingAddress,
                BillingAddress = billingAddress,
                Status = OrderStatus.Pending
            };

            await _unitOfWork.Repository<Order>().AddAsync(order, cancellationToken);

            // Record Coupon Usage Log & increment count upon order placement
            if (appliedCoupon != null)
            {
                var usageLog = new CouponUsageLog
                {
                    CouponId = appliedCoupon.Id,
                    UserId = userId,
                    OrderId = order.Id,
                    DiscountAmount = discountAmount,
                    UsedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<CouponUsageLog>().AddAsync(usageLog, cancellationToken);

                appliedCoupon.CurrentUsageCount += 1;
                _unitOfWork.Repository<Coupon>().Update(appliedCoupon);
            }

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
                    TotalPrice = ci.Product.Price * ci.Quantity
                };

                await _unitOfWork.Repository<OrderItem>().AddAsync(orderItem, cancellationToken);

                // Deduct stock quantity
                ci.Product.StockQuantity = Math.Max(0, ci.Product.StockQuantity - ci.Quantity);

                var inventoryRecord = new InventoryRecord
                {
                    ProductId = ci.ProductId,
                    QuantityChange = -ci.Quantity,
                    Reason = $"Sale (Ref: {orderNumber})",
                    ReferenceNumber = orderNumber,
                    CreatedBy = "System"
                };
                await _unitOfWork.Repository<InventoryRecord>().AddAsync(inventoryRecord, cancellationToken);
            }

            // Clear shopping cart
            var cartRepo = _unitOfWork.Repository<CartItem>();
            cartRepo.RemoveRange(cartItems);

            // Single atomic commit for entire order batch (guaranteed execution)
            await _unitOfWork.SaveChangesAsync(CancellationToken.None);

            // Fetch user email for confirmation (non-blocking)
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
                    // Email failure does not break order placement
                }
            }

            var dto = _mapper.Map<OrderDto>(order);
            return ApiResponse<OrderDto>.SuccessResponse(dto, "Order placed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to place order for user {UserId}", userId);
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

    public async Task<PagedResponse<OrderDto>> GetAllOrdersAsync(string? searchTerm, string? status, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Repository<Order>().Query()
            .Include(o => o.Items)
            .Include(o => o.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(o => o.OrderNumber.Contains(searchTerm) || o.User.Email.Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(o => o.Status == parsedStatus);
        }

        query = query.OrderByDescending(o => o.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<OrderDto>>(items);
        return PagedResponse<OrderDto>.Create(dtos, pageNumber, pageSize, totalCount, "All orders retrieved successfully.");
    }

    public async Task<ApiResponse> UpdateOrderStatusAsync(Guid orderId, OrderStatus status, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Repository<Order>().GetByIdAsync(orderId, cancellationToken);
        if (order == null)
        {
            throw new NotFoundException(nameof(Order), orderId);
        }

        order.Status = status;
        _unitOfWork.Repository<Order>().Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse.SuccessResponse($"Order status updated to {status}.");
    }
}
