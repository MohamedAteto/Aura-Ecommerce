using ECommerce.Application.Interfaces;
using ECommerce.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerce.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(DependencyInjection).Assembly);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<IDiscountService, DiscountService>();
        services.AddScoped<INewsletterService, NewsletterService>();
        services.AddValidatorsFromAssemblyContaining<AuthService>();
        return services;
    }
}
