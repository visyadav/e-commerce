using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class MenuItemConfiguration : IEntityTypeConfiguration<MenuItem>
{
    public void Configure(EntityTypeBuilder<MenuItem> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Title)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.Icon).HasMaxLength(50);
        builder.Property(m => m.Url).HasMaxLength(256);
        builder.Property(m => m.Module).HasMaxLength(50);
        builder.Property(m => m.AllowedRoles).HasMaxLength(256);

        builder.HasOne(m => m.Parent)
            .WithMany(m => m.Children)
            .HasForeignKey(m => m.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(m => new { m.ParentId, m.SortOrder });
    }
}
