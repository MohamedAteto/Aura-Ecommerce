using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IDiscountService
{
    Task<ApplyCouponResult> ApplyCouponAsync(int userId, string code, decimal subtotal, CancellationToken ct = default);
    Task<DiscountDto> CreateCouponAsync(UpsertCouponRequest request, CancellationToken ct = default);
    Task<DiscountDto> UpdateCouponAsync(int id, UpsertCouponRequest request, CancellationToken ct = default);
    Task DeleteCouponAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<DiscountDto>> GetAllCouponsAsync(CancellationToken ct = default);
}
