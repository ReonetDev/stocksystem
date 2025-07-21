using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockControlSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSizeToSerialStock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Size",
                table: "SerialStock",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Size",
                table: "SerialStock");
        }
    }
}
