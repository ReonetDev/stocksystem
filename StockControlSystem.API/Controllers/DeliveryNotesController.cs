using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Data;
using StockControlSystem.API.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using StockControlSystem.API.Services;
using StockControlSystem.API.Dtos;

namespace StockControlSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeliveryNotesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DeliveryNotesController> _logger;
        private readonly DeliveryNotePdfService _pdfService;

        public DeliveryNotesController(ApplicationDbContext context, ILogger<DeliveryNotesController> logger, DeliveryNotePdfService pdfService)
        {
            _context = context;
            _logger = logger;
            _pdfService = pdfService;
        }

        // POST: api/DeliveryNotes
        [HttpPost]
        public async Task<ActionResult<DeliveryNote>> PostDeliveryNote(DeliveryNoteDto deliveryNoteDto)
        {
            _logger.LogInformation("Received request to create delivery note.");
            _logger.LogInformation("Payload: {@DeliveryNoteDto}", deliveryNoteDto);

            if (deliveryNoteDto == null || deliveryNoteDto.Items == null || !deliveryNoteDto.Items.Any())
            {
                _logger.LogWarning("Validation failed: DTO is null or has no items.");
                return BadRequest("Delivery note must have items.");
            }

            var year = DateTime.UtcNow.Year;
            var lastDeliveryNote = await _context.DeliveryNotes.OrderByDescending(d => d.Id).FirstOrDefaultAsync();
            var sequence = (lastDeliveryNote?.Id ?? 0) + 1;

            var deliveryNote = new DeliveryNote
            {
                DelNoteNumber = $"REODN-{year}-{sequence:D5}",
                DateTime = deliveryNoteDto.DateTime,
                Destination = deliveryNoteDto.Destination,
                Comments = deliveryNoteDto.Comments,
                Items = new List<DeliveryNoteItem>()
            };

            foreach (var itemDto in deliveryNoteDto.Items)
            {
                var serialStock = await _context.SerialStock.FindAsync(itemDto.SerialStockId);
                if (serialStock == null)
                {
                    _logger.LogWarning($"Validation failed: SerialStock with ID {itemDto.SerialStockId} not found.");
                    return BadRequest($"Invalid SerialStockId: {itemDto.SerialStockId}");
                }
                deliveryNote.Items.Add(new DeliveryNoteItem { SerialStockId = itemDto.SerialStockId });
            }

            _context.DeliveryNotes.Add(deliveryNote);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created delivery note with ID {Id}", deliveryNote.Id);

            return CreatedAtAction("GetDeliveryNote", new { id = deliveryNote.Id }, deliveryNote);
        }

        // GET: api/DeliveryNotes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DeliveryNote>>> GetDeliveryNotes()
        {
            return await _context.DeliveryNotes.ToListAsync();
        }

        // GET: api/DeliveryNotes/pdf/5
        [HttpGet("pdf/{id}")]
        public IActionResult GetDeliveryNotePdf(int id)
        {
            var deliveryNote = _context.DeliveryNotes.FirstOrDefault(dn => dn.Id == id);

            if (deliveryNote == null)
            {
                return NotFound();
            }

            var pdfBytes = _pdfService.GeneratePdf(id);

            if (pdfBytes == null)
            {
                return NotFound();
            }

            Response.Headers.Add("Content-Disposition", $"attachment; filename=\"DeliveryNote_{deliveryNote.DelNoteNumber}.pdf\"");
            return File(pdfBytes, "application/pdf");
        }

        // GET: api/DeliveryNotes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DeliveryNote>> GetDeliveryNote(int id)
        {
            var deliveryNote = await _context.DeliveryNotes
                .Include(d => d.Items)
                .ThenInclude(i => i.SerialStock)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (deliveryNote == null)
            {
                return NotFound();
            }

            return deliveryNote;
        }
    }
}
