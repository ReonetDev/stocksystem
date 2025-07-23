using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using StockControlSystem.API.Data;
using StockControlSystem.API.Models;
using System.IO;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace StockControlSystem.API.Services
{
    public class DeliveryNotePdfService
    {
        private readonly ApplicationDbContext _context;
        private readonly string _assetsPath;

        public DeliveryNotePdfService(ApplicationDbContext context)
        {
            _context = context;
            
            var assemblyLocation = AppContext.BaseDirectory;
            var dir = new DirectoryInfo(assemblyLocation);

            // Look for the solution file to determine if we are in a development environment
            while (dir != null && !dir.GetFiles("*.sln").Any())
            {
                dir = dir.Parent;
            }

            if (dir != null) // We are in development
            {
                _assetsPath = Path.Combine(dir.FullName, "client-app", "src", "assets");
            }
            else // We are in a production environment
            {
                // Based on the release.yml, the API executable is inside the packaged application.
                // The client assets are also packaged. We need to find their relative path.
                // A common structure is `api` and `dist` folders at the same level.
                var prodPath = Path.GetFullPath(Path.Combine(assemblyLocation, "..", "..", "dist", "assets"));
                if (Directory.Exists(prodPath))
                {
                    _assetsPath = prodPath;
                }
                else
                {
                    // If the primary production path is not found, throw an exception to make the issue visible.
                    throw new DirectoryNotFoundException($"Could not find the assets directory in production. Path checked: {prodPath}");
                }
            }
        }

        public byte[] GeneratePdf(int deliveryNoteId)
        {
            // Retrieve the delivery note with its items and serial stock details
            var deliveryNote = _context.DeliveryNotes
                .Include(dn => dn.Items)
                .ThenInclude(dni => dni.SerialStock)
                .FirstOrDefault(dn => dn.Id == deliveryNoteId);

            if (deliveryNote == null)
            {
                return null; // Or throw an exception
            }

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header()
                        .PaddingBottom(1, Unit.Centimetre)
                        .Row(row =>
                        {
                            row.RelativeItem().Column(column =>
                            {
                                column.Item().Text($"Delivery Note: {deliveryNote.DelNoteNumber}").FontSize(16).Bold();
                                column.Item().Text($"Date: {deliveryNote.DateTime:dd/MM/yyyy HH:mm}");
                            });

                            row.ConstantItem((float)87.04).Image(Path.Combine(_assetsPath, "reologo.gif")); // 128px * 0.80 = 87.04px
                        });

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            column.Item().Text($"Destination: {deliveryNote.Destination}").FontSize(12);
                            column.Item().Text($"Comments: {deliveryNote.Comments}");

                            column.Item().PaddingTop(1, Unit.Centimetre).Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(); // Serial Number
                                    columns.RelativeColumn(2); // Description
                                    columns.RelativeColumn(); // Make
                                    columns.RelativeColumn(); // Model
                                    columns.RelativeColumn(); // Size
                                });

                                table.Header(header =>
                                {
                                    header.Cell().BorderBottom(1).Padding(5).Text("Serial Number").Bold();
                                    header.Cell().BorderBottom(1).Padding(5).Text("Description").Bold();
                                    header.Cell().BorderBottom(1).Padding(5).Text("Make").Bold();
                                    header.Cell().BorderBottom(1).Padding(5).Text("Model").Bold();
                                    header.Cell().BorderBottom(1).Padding(5).Text("Size").Bold();
                                });

                                foreach (var item in deliveryNote.Items)
                                {
                                    table.Cell().BorderBottom(1).Padding(5).Text(item.SerialStock?.SerialNumber ?? "N/A");
                                    table.Cell().BorderBottom(1).Padding(5).Text(item.SerialStock?.Description ?? "N/A");
                                    table.Cell().BorderBottom(1).Padding(5).Text(item.SerialStock?.Make ?? "N/A");
                                    table.Cell().BorderBottom(1).Padding(5).Text(item.SerialStock?.Model ?? "N/A");
                                    table.Cell().BorderBottom(1).Padding(5).Text(item.SerialStock?.Size ?? "N/A");
                                }
                            });

                            column.Item().PaddingTop(2, Unit.Centimetre).Column(signatureColumn =>
                            {
                                signatureColumn.Item().Text("Receiver's Signature:").Bold();
                                signatureColumn.Item().PaddingTop(1, Unit.Centimetre).LineHorizontal(1);
                            });
                        });

                    page.Footer()
                        .PaddingBottom(1, Unit.Centimetre)
                        .Row(row =>
                        {
                            row.RelativeItem().AlignRight().Text(x =>
                            {
                                x.Span("Page ");
                                x.CurrentPageNumber();
                                x.Span(" of ");
                                x.TotalPages();
                            });
                        });
                });
            }).GeneratePdf();
        }
    }
}