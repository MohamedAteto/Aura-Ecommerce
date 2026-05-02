namespace ECommerce.Application.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string Message { get; set; } = string.Empty;

    public ApiResponse() { }

    public ApiResponse(bool success, T? data, string message = "")
    {
        Success = success;
        Data = data;
        Message = message;
    }

    public static ApiResponse<T> Ok(T data, string message = "") =>
        new(true, data, message);

    public static ApiResponse<T> Fail(string message) =>
        new(false, default, message);
}

public class ApiResponse
{
    public bool Success { get; set; }
    public object? Data { get; set; }
    public string Message { get; set; } = string.Empty;

    public static ApiResponse Ok(string message = "") =>
        new() { Success = true, Message = message };

    public static ApiResponse Fail(string message) =>
        new() { Success = false, Message = message };
}
