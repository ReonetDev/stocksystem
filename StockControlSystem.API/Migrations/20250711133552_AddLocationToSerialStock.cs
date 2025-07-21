using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockControlSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationToSerialStock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "SerialStock",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "SerialStock");
        }
    }
}
