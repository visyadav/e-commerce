using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class UserMenuPermissionConfiguration : IEntityTypeConfiguration<UserMenuPermission>
{
    public void Configure(EntityTypeBuilder<UserMenuPermission> builder)
    {
        builder.HasKey(ump => ump.Id);

        // Composite unique index
        builder.HasIndex(ump => new { ump.UserId, ump.MenuItemId }).IsUnique();

        // Relationships
        builder.HasOne(ump => ump.User)
            .WithMany()
            .HasForeignKey(ump => ump.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ump => ump.MenuItem)
            .WithMany()
            .HasForeignKey(ump => ump.MenuItemId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
