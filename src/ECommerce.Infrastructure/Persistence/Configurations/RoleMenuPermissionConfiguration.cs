using ECommerce.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class RoleMenuPermissionConfiguration : IEntityTypeConfiguration<RoleMenuPermission>
{
    public void Configure(EntityTypeBuilder<RoleMenuPermission> builder)
    {
        builder.HasKey(rmp => rmp.Id);

        // Composite unique index
        builder.HasIndex(rmp => new { rmp.RoleId, rmp.MenuItemId }).IsUnique();

        // Relationships
        builder.HasOne(rmp => rmp.Role)
            .WithMany()
            .HasForeignKey(rmp => rmp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(rmp => rmp.MenuItem)
            .WithMany()
            .HasForeignKey(rmp => rmp.MenuItemId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
