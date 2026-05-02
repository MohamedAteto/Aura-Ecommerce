using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync(CancellationToken ct = default);
    Task<DashboardDto> GetDashboardAsync(CancellationToken ct = default);
}
