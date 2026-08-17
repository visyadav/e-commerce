using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceableAreas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ServiceableAreas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    State = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pincode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    RadiusInKm = table.Column<double>(type: "float", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CutoffTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceableAreas", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ServiceableAreas",
                columns: new[] { "Id", "City", "CreatedAt", "CutoffTime", "IsActive", "Latitude", "Longitude", "Name", "Pincode", "RadiusInKm", "State" },
                values: new object[] { new Guid("7a9f4c3b-2e8d-4f1a-9b5c-3d7e1f4a8b2c"), "Noida", new DateTime(2026, 8, 17, 6, 23, 24, 408, DateTimeKind.Utc).AddTicks(3960), new TimeSpan(0, 23, 59, 0, 0), true, 28.628, 77.364900000000006, "Sector 62 Hub - Noida", "201309", 5.0, "Uttar Pradesh" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceableAreas");
        }
    }
}
