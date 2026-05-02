using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface ICartService
{
    Task<IReadOnlyList<CartItemDto>> GetCartAsync(int userId, CancellationToken ct = default);
    Task<CartResponseDto> GetCartResponseAsync(int userId, CancellationToken ct = default);
    Task AddAsync(int userId, AddToCartRequest request, CancellationToken ct = default);
    Task UpdateQuantityAsync(int userId, int cartItemId, UpdateCartItemRequest request, CancellationToken ct = default);
    Task RemoveAsync(int userId, int cartItemId, CancellationToken ct = default);
    Task<CartResponseDto> ApplyCouponAsync(int userId, string code, CancellationToken ct = default);
    Task<CartResponseDto> SyncGuestCartAsync(int userId, IReadOnlyList<GuestCartItem> items, CancellationToken ct = default);
}
