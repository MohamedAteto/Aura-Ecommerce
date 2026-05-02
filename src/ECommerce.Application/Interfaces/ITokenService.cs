using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface ITokenService
{
    string CreateToken(User user);
}
