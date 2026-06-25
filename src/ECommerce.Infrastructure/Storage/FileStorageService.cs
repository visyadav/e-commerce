using System.IO;

namespace ECommerce.Infrastructure.Storage;

public class FileStorageService : IFileStorageService
{
    private readonly string _basePath;

    public FileStorageService()
    {
        // Save files inside the running API's wwwroot directory
        _basePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folderName, CancellationToken cancellationToken = default)
    {
        if (fileStream == null || fileStream.Length == 0)
            throw new ArgumentException("File stream is empty", nameof(fileStream));

        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        var folderPath = Path.Combine(_basePath, "uploads", folderName);
        var filePath = Path.Combine(folderPath, uniqueFileName);

        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        using (var fileStreamOutput = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true))
        {
            await fileStream.CopyToAsync(fileStreamOutput, cancellationToken);
        }

        // Return relative URL path
        return $"/uploads/{folderName}/{uniqueFileName}";
    }

    public Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
            return Task.CompletedTask;

        // Extract relative path from URL (e.g. "/uploads/products/xyz.jpg" -> "uploads/products/xyz.jpg")
        var relativePath = fileUrl.TrimStart('/');
        var filePath = Path.Combine(_basePath, relativePath);

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }
}
