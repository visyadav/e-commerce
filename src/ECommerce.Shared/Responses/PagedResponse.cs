namespace ECommerce.Shared.Responses;

public class PagedResponse<T>
{
    public bool Success { get; set; } = true;
    public string Message { get; set; } = "Request completed successfully.";
    public List<T> Data { get; set; } = [];
    public List<string> Errors { get; set; } = [];
    public PaginationMeta Pagination { get; set; } = new();

    public static PagedResponse<T> Create(
        List<T> data,
        int currentPage,
        int pageSize,
        int totalCount,
        string message = "Request completed successfully.")
    {
        return new PagedResponse<T>
        {
            Success = true,
            Message = message,
            Data = data,
            Pagination = new PaginationMeta
            {
                CurrentPage = currentPage,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                HasPrevious = currentPage > 1,
                HasNext = currentPage < (int)Math.Ceiling(totalCount / (double)pageSize)
            }
        };
    }
}

public class PaginationMeta
{
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public bool HasPrevious { get; set; }
    public bool HasNext { get; set; }
}
