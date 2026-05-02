using AutoMapper;
using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Services;

public class DiscountService : IDiscountService
{
    private readonly IDiscountRepository _discounts;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DiscountService(IDiscountRepository discounts, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _discounts = discounts;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApplyCouponResult> ApplyCouponAsync(int userId, string code, decimal subtotal, CancellationToken ct = default)
    {
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

        return new ApplyCouponResult
        {
            CouponCode = discount.Code,
            DiscountAmount = discountAmount,
            Subtotal = subtotal,
            Total = subtotal - discountAmount
        };
    }

    public async Task<DiscountDto> CreateCouponAsync(UpsertCouponRequest request, CancellationToken ct = default)
    {
        var existing = await _discounts.GetByCodeAsync(request.Code, ct);
        if (existing is not null)
            throw new AppException("A coupon with this code already exists.", 409);

        var discount = new Discount
        {
            Code = request.Code.Trim().ToUpper(),
            Type = request.Type,
            Value = request.Value,
            MinOrderAmount = request.MinOrderAmount,
            MaxUses = request.MaxUses,
            ExpiresAtUtc = request.ExpiresAtUtc,
            IsActive = request.IsActive
        };
        await _discounts.AddAsync(discount, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return _mapper.Map<DiscountDto>(discount);
    }

    public async Task<DiscountDto> UpdateCouponAsync(int id, UpsertCouponRequest request, CancellationToken ct = default)
    {
        var discount = await _discounts.GetByIdAsync(id, ct) ?? throw new AppException("Coupon not found.", 404);
        discount.Code = request.Code.Trim().ToUpper();
        discount.Type = request.Type;
        discount.Value = request.Value;
        discount.MinOrderAmount = request.MinOrderAmount;
        discount.MaxUses = request.MaxUses;
        discount.ExpiresAtUtc = request.ExpiresAtUtc;
        discount.IsActive = request.IsActive;
        _discounts.Update(discount);
        await _unitOfWork.SaveChangesAsync(ct);
        return _mapper.Map<DiscountDto>(discount);
    }

    public async Task DeleteCouponAsync(int id, CancellationToken ct = default)
    {
        var discount = await _discounts.GetByIdAsync(id, ct) ?? throw new AppException("Coupon not found.", 404);
        _discounts.Remove(discount);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<DiscountDto>> GetAllCouponsAsync(CancellationToken ct = default)
    {
        var list = await _discounts.GetAllAsync(ct);
        return _mapper.Map<List<DiscountDto>>(list);
    }
}
