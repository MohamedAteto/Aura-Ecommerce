using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class CartRepository : ICartRepository
{
    private readonly AppDbContext _db;

    public CartRepository(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<CartItem>> GetByUserIdAsync(int userId, CancellationToken ct = default) =>
        await _db.CartItems.AsNoTracking()
            .Where(x => x.UserId == userId)
            .Include(x => x.Product)
            .Include(x => x.Variation)
            .OrderBy(x => x.Id)
            .ToListAsync(ct);

    public Task<CartItem?> GetItemAsync(int userId, int productId, int? variationId, CancellationToken ct = default) =>
        _db.CartItems
            .Include(x => x.Product)
            .Include(x => x.Variation)
            .FirstOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId && x.VariationId == variationId, ct);

    public Task<CartItem?> GetByIdAsync(int cartItemId, CancellationToken ct = default) =>
        _db.CartItems
            .Include(x => x.Product)
            .Include(x => x.Variation)
            .FirstOrDefaultAsync(x => x.Id == cartItemId, ct);

    public async Task AddAsync(CartItem item, CancellationToken ct = default) =>
        await _db.CartItems.AddAsync(item, ct);

    public void Remove(CartItem item) => _db.CartItems.Remove(item);

    public async Task ClearForUserAsync(int userId, CancellationToken ct = default)
    {
        var items = await _db.CartItems.Where(x => x.UserId == userId).ToListAsync(ct);
        _db.CartItems.RemoveRange(items);
    }
}
