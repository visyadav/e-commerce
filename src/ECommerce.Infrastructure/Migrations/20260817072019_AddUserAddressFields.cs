using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAddressFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HouseNo",
                schema: "ecom",
                table: "UserAddresses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Landmark",
                schema: "ecom",
                table: "UserAddresses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                schema: "ecom",
                table: "UserAddresses",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                schema: "ecom",
                table: "UserAddresses",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HouseNo",
                schema: "ecom",
                table: "UserAddresses");

            migrationBuilder.DropColumn(
                name: "Landmark",
                schema: "ecom",
                table: "UserAddresses");

            migrationBuilder.DropColumn(
                name: "Latitude",
                schema: "ecom",
                table: "UserAddresses");

            migrationBuilder.DropColumn(
                name: "Longitude",
                schema: "ecom",
                table: "UserAddresses");
        }
    }
}
