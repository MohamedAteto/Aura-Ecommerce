using ECommerce.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected new IActionResult Ok<T>(T data, string message = "") =>
        base.Ok(new ApiResponse<T>(true, data, message));

    protected IActionResult Created<T>(string location, T data, string message = "") =>
        base.Created(location, new ApiResponse<T>(true, data, message));

    protected new IActionResult NoContent() =>
        base.Ok(new ApiResponse<object>(true, null, ""));

    protected new IActionResult BadRequest(string message) =>
        base.BadRequest(new ApiResponse<object>(false, null, message));

    protected IActionResult NotFound(string message) =>
        base.NotFound(new ApiResponse<object>(false, null, message));

    protected IActionResult Conflict(string message) =>
        base.Conflict(new ApiResponse<object>(false, null, message));
}
