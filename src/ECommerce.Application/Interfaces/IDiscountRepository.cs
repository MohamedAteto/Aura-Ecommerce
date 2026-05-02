using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface IDiscountRepository
{
    Task<Discount?> GetByCodeAsync(string code, CancellationToken ct = default);
    Task<Discount?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Discount>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(Discount discount, CancellationToken ct = default);
    void Update(Discount discount);
    void Remove(Discount discount);
}
