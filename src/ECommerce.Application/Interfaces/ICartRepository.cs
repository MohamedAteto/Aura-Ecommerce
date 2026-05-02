using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface ICartRepository
{
    Task<IReadOnlyList<CartItem>> GetByUserIdAsync(int userId, CancellationToken ct = default);
    Task<CartItem?> GetItemAsync(int userId, int productId, int? variationId, CancellationToken ct = default);
    Task<CartItem?> GetByIdAsync(int cartItemId, CancellationToken ct = default);
    Task AddAsync(CartItem item, CancellationToken ct = default);
    void Remove(CartItem item);
    Task ClearForUserAsync(int userId, CancellationToken ct = default);
}
