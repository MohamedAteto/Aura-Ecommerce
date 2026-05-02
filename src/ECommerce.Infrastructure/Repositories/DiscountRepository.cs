using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class DiscountRepository : IDiscountRepository
{
    private readonly AppDbContext _db;

    public DiscountRepository(AppDbContext db) => _db = db;

    public Task<Discount?> GetByCodeAsync(string code, CancellationToken ct = default) =>
        _db.Discounts.FirstOrDefaultAsync(d => d.Code.ToLower() == code.ToLower(), ct);

    public Task<Discount?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.Discounts.FirstOrDefaultAsync(d => d.Id == id, ct);

    public async Task<IReadOnlyList<Discount>> GetAllAsync(CancellationToken ct = default) =>
        await _db.Discounts.AsNoTracking().OrderBy(d => d.Code).ToListAsync(ct);

    public async Task AddAsync(Discount discount, CancellationToken ct = default) =>
        await _db.Discounts.AddAsync(discount, ct);

    public void Update(Discount discount) => _db.Discounts.Update(discount);

    public void Remove(Discount discount) => _db.Discounts.Remove(discount);
}
