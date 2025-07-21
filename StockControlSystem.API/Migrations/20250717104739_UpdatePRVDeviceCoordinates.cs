using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockControlSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePRVDeviceCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitutue",
                table: "PRVDevices");

            migrationBuilder.DropColumn(
                name: "Longitute",
                table: "PRVDevices");

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "PRVDevices",
                type: "double",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "PRVDevices",
                type: "double",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "PRVDevices");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "PRVDevices");

            migrationBuilder.AddColumn<string>(
                name: "Latitutue",
                table: "PRVDevices",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Longitute",
                table: "PRVDevices",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
