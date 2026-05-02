using System.Net;
using System.Text.Json;
using ECommerce.Application.Exceptions;
using FluentValidation;

namespace ECommerce.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await WriteError(context, ex);
        }
    }

    private static async Task WriteError(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";
        int code = (int)HttpStatusCode.InternalServerError;
        object body;

        switch (ex)
        {
            case AppException app:
                code = app.StatusCode;
                body = new { success = false, data = (object?)null, message = app.Message };
                break;
            case ValidationException ve:
                code = 400;
                var errors = ve.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray());
                body = new { success = false, data = new { errors }, message = "Validation failed" };
                break;
            default:
                body = new { success = false, data = (object?)null, message = "An unexpected error occurred." };
                break;
        }

        if (!context.Response.HasStarted)
        {
            context.Response.StatusCode = code;
            await context.Response.WriteAsync(JsonSerializer.Serialize(body,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
        }
    }
}
