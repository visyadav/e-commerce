namespace ECommerce.Domain.ValueObjects;

public class Money
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";

    public Money() { }

    public Money(decimal amount, string currency = "USD")
    {
        Amount = amount;
        Currency = currency;
    }

    public override string ToString() => $"{Currency} {Amount:F2}";

    public override bool Equals(object? obj)
    {
        if (obj is not Money other) return false;
        return Amount == other.Amount && Currency == other.Currency;
    }

    public override int GetHashCode() => HashCode.Combine(Amount, Currency);
}
