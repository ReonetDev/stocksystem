using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockControlSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTransducerToPRVDeviceAgain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Transducer",
                table: "PRVDevices",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Transducer",
                table: "PRVDevices");
        }
    }
}
