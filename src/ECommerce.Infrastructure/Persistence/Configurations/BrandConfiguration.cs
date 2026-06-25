using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(b => b.Slug)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasIndex(b => b.Slug).IsUnique();

        builder.HasQueryFilter(b => !b.IsDeleted);
    }
}
