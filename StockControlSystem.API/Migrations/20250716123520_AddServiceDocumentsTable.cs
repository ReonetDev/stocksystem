using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockControlSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceDocumentsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "PRVServices");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "PRVServices");

            migrationBuilder.DropColumn(
                name: "TotalDays",
                table: "PRVServices");

            migrationBuilder.DropColumn(
                name: "TotalWeekdays",
                table: "PRVServices");

            migrationBuilder.CreateTable(
                name: "ServiceDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    PRVServiceId = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FilePath = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AttachmentType = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UploadDate = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceDocuments_PRVServices_PRVServiceId",
                        column: x => x.PRVServiceId,
                        principalTable: "PRVServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceDocuments_PRVServiceId",
                table: "ServiceDocuments",
                column: "PRVServiceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceDocuments");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "PRVServices",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "PRVServices",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "TotalDays",
                table: "PRVServices",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalWeekdays",
                table: "PRVServices",
                type: "int",
                nullable: true);
        }
    }
}
