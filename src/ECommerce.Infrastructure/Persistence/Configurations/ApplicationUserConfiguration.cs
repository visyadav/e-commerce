using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.Address).HasMaxLength(500);
        builder.Property(u => u.City).HasMaxLength(100);
        builder.Property(u => u.State).HasMaxLength(100);
        builder.Property(u => u.Country).HasMaxLength(100);
        builder.Property(u => u.ZipCode).HasMaxLength(20);
    }
}
