using ECommerce.Application.Exceptions;
using ECommerce.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin)]
public class MediaController : ApiControllerBase
{
    private static readonly HashSet<string> AllowedExt = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".gif", ".webp"
    };

    private readonly IWebHostEnvironment _env;

    public MediaController(IWebHostEnvironment env) => _env = env;

    public class UploadResponse
    {
        public string Url { get; set; } = null!;
    }

    [HttpPost("upload")]
    [RequestSizeLimit(6_000_000)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            throw new AppException("No file uploaded.");

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(ext) || !AllowedExt.Contains(ext))
            throw new AppException("Invalid file type. Allowed: jpg, jpeg, png, gif, webp.");

        var webRoot = string.IsNullOrEmpty(_env.WebRootPath)
            ? Path.Combine(_env.ContentRootPath, "wwwroot")
            : _env.WebRootPath;
        var uploads = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploads);

        var fn = $"{Guid.NewGuid():N}{ext}";
        var physical = Path.Combine(uploads, fn);
        await using (var stream = System.IO.File.Create(physical))
            await file.CopyToAsync(stream, ct);

        var url = $"{Request.Scheme}://{Request.Host}/uploads/{fn}";
        return Ok(new UploadResponse { Url = url });
    }
}
