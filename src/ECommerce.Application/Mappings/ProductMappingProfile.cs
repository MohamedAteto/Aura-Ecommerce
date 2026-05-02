using AutoMapper;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Mappings;

public class ProductMappingProfile : Profile
{
    public ProductMappingProfile()
    {
        CreateMap<Product, ProductDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : string.Empty))
            .ForMember(d => d.AverageRating, o => o.MapFrom(s =>
                s.Reviews != null && s.Reviews.Count > 0
                    ? Math.Round((decimal)s.Reviews.Average(r => r.Rating), 1)
                    : 0m))
            .ForMember(d => d.ReviewCount, o => o.MapFrom(s => s.Reviews != null ? s.Reviews.Count : 0))
            .ForMember(d => d.InStock, o => o.MapFrom(s =>
                s.Variations != null && s.Variations.Count > 0
                    ? s.Variations.Any(v => v.StockQuantity > 0)
                    : s.StockQuantity > 0))
            .ForMember(d => d.Variations, o => o.MapFrom(s => s.Variations ?? new List<ProductVariation>()));

        CreateMap<ProductVariation, ProductVariationDto>();

        CreateMap<Review, ReviewDto>()
            .ForMember(d => d.UserName, o => o.MapFrom(s => s.User != null ? s.User.FullName : "Anonymous"));
    }
}
