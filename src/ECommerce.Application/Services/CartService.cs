using AutoMapper;
using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cart;
    private readonly IProductRepository _products;
    private readonly IDiscountRepository _discounts;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CartService(ICartRepository cart, IProductRepository products,
        IDiscountRepository discounts, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _cart = cart;
        _products = products;
        _discounts = discounts;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<CartItemDto>> GetCartAsync(int userId, CancellationToken ct = default)
    {
        var items = await _cart.GetByUserIdAsync(userId, ct);
        return _mapper.Map<List<CartItemDto>>(items);
    }

    public async Task<CartResponseDto> GetCartResponseAsync(int userId, CancellationToken ct = default)
    {
        var items = await _cart.GetByUserIdAsync(userId, ct);
        var dtos = _mapper.Map<List<CartItemDto>>(items);
        var subtotal = dtos.Sum(i => i.LineTotal);
        return new CartResponseDto
        {
            Items = dtos,
            Subtotal = subtotal,
            DiscountAmount = 0,
            CouponCode = null,
            Total = subtotal
        };
    }

    public async Task AddAsync(int userId, AddToCartRequest request, CancellationToken ct = default)
    {
        if (request.Quantity < 1) throw new AppException("Quantity must be at least 1.");
        var product = await _products.GetByIdAsync(request.ProductId, ct) ?? throw new AppException("Product not found.", 404);

        if (request.VariationId.HasValue)
        {
            var variation = product.Variations.FirstOrDefault(v => v.Id == request.VariationId.Value)
                ?? throw new AppException("Variation not found.", 404);
            if (variation.StockQuantity == 0)
                throw new AppException("This variant is out of stock.");
            if (request.Quantity > variation.StockQuantity)
                throw new AppException($"Insufficient stock. Only {variation.StockQuantity} unit(s) available.");
        }
        else if (product.Variations.Count == 0)
        {
            if (product.StockQuantity == 0)
                throw new AppException("This product is out of stock.");
            if (request.Quantity > product.StockQuantity)
                throw new AppException($"Insufficient stock. Only {product.StockQuantity} unit(s) available.");
        }

        var existing = await _cart.GetItemAsync(userId, request.ProductId, request.VariationId, ct);
        if (existing is not null)
        {
            existing.Quantity += request.Quantity;
        }
        else
        {
            await _cart.AddAsync(new CartItem
            {
                UserId = userId,
                ProductId = product.Id,
                Quantity = request.Quantity,
                VariationId = request.VariationId
            }, ct);
        }

        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task UpdateQuantityAsync(int userId, int cartItemId, UpdateCartItemRequest request, CancellationToken ct = default)
    {
        if (request.Quantity < 1) throw new AppException("Quantity must be at least 1.");
        var item = await _cart.GetByIdAsync(cartItemId, ct) ?? throw new AppException("Cart item not found.", 404);
        if (item.UserId != userId) throw new AppException("Forbidden.", 403);
        item.Quantity = request.Quantity;
        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task RemoveAsync(int userId, int cartItemId, CancellationToken ct = default)
    {
        var item = await _cart.GetByIdAsync(cartItemId, ct) ?? throw new AppException("Cart item not found.", 404);
        if (item.UserId != userId) throw new AppException("Forbidden.", 403);
        _cart.Remove(item);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task<CartResponseDto> ApplyCouponAsync(int userId, string code, CancellationToken ct = default)
    {
        var items = await _cart.GetByUserIdAsync(userId, ct);
        var dtos = _mapper.Map<List<CartItemDto>>(items);
        var subtotal = dtos.Sum(i => i.LineTotal);

        var discount = await _discounts.GetByCodeAsync(code, ct);
        if (discount is null || !discount.IsActive)
            throw new AppException("Invalid or expired coupon code.");

        if (discount.ExpiresAtUtc.HasValue && discount.ExpiresAtUtc.Value < DateTime.UtcNow)
            throw new AppException("Invalid or expired coupon code.");

        if (discount.MaxUses.HasValue && discount.UsedCount >= discount.MaxUses.Value)
            throw new AppException("This coupon has reached its usage limit.");

        if (subtotal < discount.MinOrderAmount)
            throw new AppException($"Minimum order amount of {discount.MinOrderAmount:F2} required for this coupon.");

        decimal discountAmount = discount.Type == DiscountTypes.Percentage
            ? Math.Round(subtotal * discount.Value / 100, 2)
            : Math.Min(discount.Value, subtotal);

        return new CartResponseDto
        {
            Items = dtos,
            Subtotal = subtotal,
            DiscountAmount = discountAmount,
            CouponCode = discount.Code,
            Total = subtotal - discountAmount
        };
    }

    public async Task<CartResponseDto> SyncGuestCartAsync(int userId, IReadOnlyList<GuestCartItem> guestItems, CancellationToken ct = default)
    {
        if (guestItems == null || guestItems.Count == 0)
            return await GetCartResponseAsync(userId, ct);

        foreach (var guestItem in guestItems)
        {
            var product = await _products.GetByIdAsync(guestItem.ProductId, ct);
            if (product is null) continue;

            var existing = await _cart.GetItemAsync(userId, guestItem.ProductId, guestItem.VariationId, ct);
            if (existing is not null)
            {
                existing.Quantity += guestItem.Quantity;
            }
            else
            {
                await _cart.AddAsync(new CartItem
                {
                    UserId = userId,
                    ProductId = guestItem.ProductId,
                    Quantity = guestItem.Quantity,
                    VariationId = guestItem.VariationId
                }, ct);
            }
        }

        await _unitOfWork.SaveChangesAsync(ct);
        return await GetCartResponseAsync(userId, ct);
    }
}
