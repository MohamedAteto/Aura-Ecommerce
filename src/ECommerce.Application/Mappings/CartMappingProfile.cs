using AutoMapper;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Mappings;

public class CartMappingProfile : Profile
{
    public CartMappingProfile()
    {
        CreateMap<CartItem, CartItemDto>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product != null ? s.Product.Name : string.Empty))
            .ForMember(d => d.ImageUrl, o => o.MapFrom(s => s.Product != null ? s.Product.ImageUrl : string.Empty))
            .ForMember(d => d.UnitPrice, o => o.MapFrom(s =>
                s.Product != null
                    ? s.Product.Price + (s.Variation != null ? s.Variation.PriceDelta : 0m)
                    : 0m))
            .ForMember(d => d.VariationLabel, o => o.MapFrom(s =>
                s.Variation != null
                    ? string.Join(" / ", new[] { s.Variation.Size, s.Variation.Color }.Where(x => !string.IsNullOrEmpty(x)))
                    : null));
    }
}
