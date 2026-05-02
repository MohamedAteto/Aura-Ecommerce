using AutoMapper;
using ECommerce.Application.Common;
using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Services;

public class OrderService : IOrderService
{
    private readonly ICartRepository _cart;
    private readonly IOrderRepository _orders;
    private readonly IProductRepository _products;
    private readonly IDiscountRepository _discounts;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public OrderService(ICartRepository cart, IOrderRepository orders, IProductRepository products,
        IDiscountRepository discounts, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _cart = cart;
        _orders = orders;
        _products = products;
        _discounts = discounts;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<OrderDto> CheckoutAsync(int userId, string? couponCode, CancellationToken ct = default)
    {
        var cartItems = await _cart.GetByUserIdAsync(userId, ct);
        if (cartItems.Count == 0)
            throw new AppException("Your cart is empty.");

        decimal subtotal = 0;
        var orderItems = new List<OrderItem>();

        foreach (var line in cartItems)
        {
            var product = await _products.GetByIdAsync(line.ProductId, ct)
                ?? throw new AppException($"Product {line.ProductId} not found.", 404);

            decimal price = product.Price;

            if (line.VariationId.HasValue)
            {
                var variation = product.Variations.FirstOrDefault(v => v.Id == line.VariationId.Value)
                    ?? throw new AppException("Variation not found.", 404);
                if (variation.StockQuantity < line.Quantity)
                    throw new AppException($"Insufficient stock for variation. Only {variation.StockQuantity} unit(s) available.");
                variation.StockQuantity -= line.Quantity;
                price += variation.PriceDelta;
            }
            else
            {
                if (product.StockQuantity < line.Quantity)
                    throw new AppException($"Insufficient stock. Only {product.StockQuantity} unit(s) available.");
                product.StockQuantity -= line.Quantity;
            }

            _products.Update(product);
            subtotal += price * line.Quantity;
            orderItems.Add(new OrderItem
            {
                ProductId = line.ProductId,
                ProductName = product.Name,
                UnitPrice = price,
                Quantity = line.Quantity
            });
        }

        decimal discountAmount = 0;
        string? appliedCoupon = null;

        if (!string.IsNullOrWhiteSpace(couponCode))
        {
            var discount = await _discounts.GetByCodeAsync(couponCode, ct);
            if (discount != null && discount.IsActive
                && (!discount.ExpiresAtUtc.HasValue || discount.ExpiresAtUtc.Value >= DateTime.UtcNow)
                && (!discount.MaxUses.HasValue || discount.UsedCount < discount.MaxUses.Value)
                && subtotal >= discount.MinOrderAmount)
            {
                discountAmount = discount.Type == DiscountTypes.Percentage
                    ? Math.Round(subtotal * discount.Value / 100, 2)
                    : Math.Min(discount.Value, subtotal);
                discount.UsedCount++;
                appliedCoupon = discount.Code;
            }
        }

        var order = new Order
        {
            UserId = userId,
            CreatedAtUtc = DateTime.UtcNow,
            Status = OrderStatuses.Pending,
            TotalAmount = subtotal,
            DiscountAmount = discountAmount,
            CouponCode = appliedCoupon,
            Items = orderItems
        };

        await _orders.AddAsync(order, ct);
        await _cart.ClearForUserAsync(userId, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return _mapper.Map<OrderDto>(await _orders.GetByIdAsync(order.Id, ct) ?? order);
    }

    public async Task<PagedResult<OrderDto>> GetMyOrdersPagedAsync(int userId, int page, int pageSize, CancellationToken ct = default)
    {
        var result = await _orders.GetByUserIdPagedAsync(userId, page, pageSize, ct);
        return new PagedResult<OrderDto>
        {
            Items = _mapper.Map<List<OrderDto>>(result.Items),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount
        };
    }

    public async Task<IReadOnlyList<OrderDto>> GetMyOrdersAsync(int userId, CancellationToken ct = default)
    {
        var list = await _orders.GetByUserIdAsync(userId, ct);
        return _mapper.Map<List<OrderDto>>(list);
    }

    public async Task<OrderDto> GetOrderAsync(int userId, int orderId, bool isAdmin, CancellationToken ct = default)
    {
        var order = await _orders.GetByIdAsync(orderId, ct) ?? throw new AppException("Order not found.", 404);
        if (!isAdmin && order.UserId != userId)
            throw new AppException("Forbidden.", 403);
        return _mapper.Map<OrderDto>(order);
    }

    public async Task<IReadOnlyList<OrderDto>> GetAllOrdersAsync(CancellationToken ct = default)
    {
        var list = await _orders.GetAllAsync(ct);
        return _mapper.Map<List<OrderDto>>(list);
    }

    public async Task<OrderDto> SimulatePaymentAsync(int userId, int orderId, PaymentSimulateRequest request, bool isAdmin, CancellationToken ct = default)
    {
        var order = await _orders.GetByIdAsync(orderId, ct) ?? throw new AppException("Order not found.", 404);
        if (!isAdmin && order.UserId != userId)
            throw new AppException("Forbidden.", 403);
        if (order.Status != OrderStatuses.Pending)
            throw new AppException("Order is not awaiting payment.");

        order.Status = request.Succeed ? OrderStatuses.Processing : OrderStatuses.Failed;
        await _unitOfWork.SaveChangesAsync(ct);
        return _mapper.Map<OrderDto>(await _orders.GetByIdAsync(orderId, ct) ?? order);
    }

    public async Task<OrderDto> AdvanceStatusAsync(int orderId, string newStatus, CancellationToken ct = default)
    {
        var order = await _orders.GetByIdAsync(orderId, ct) ?? throw new AppException("Order not found.", 404);

        if (!OrderStatuses.IsValidTransition(order.Status, newStatus))
            throw new AppException($"Invalid status transition from {order.Status} to {newStatus}.");

        order.Status = newStatus;
        await _unitOfWork.SaveChangesAsync(ct);
        return _mapper.Map<OrderDto>(await _orders.GetByIdAsync(orderId, ct) ?? order);
    }
}
