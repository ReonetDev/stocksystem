using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Data;
using StockControlSystem.API.Models;
using StockControlSystem.API.Dtos;
using StockControlSystem.API.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace StockControlSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SimCardsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly StockMovementLogger _movementLogger;

        public SimCardsController(ApplicationDbContext context, StockMovementLogger movementLogger)
        {
            _context = context;
            _movementLogger = movementLogger;
        }

        // GET: api/SimCards
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SimCard>>> GetSimCards()
        {
            return await _context.SimCards.ToListAsync();
        }

        // GET: api/SimCards/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SimCard>> GetSimCard(int id)
        {
            var simCard = await _context.SimCards.FindAsync(id);

            if (simCard == null)
            {
                return NotFound();
            }

            return simCard;
        }

        // POST: api/SimCards
        [HttpPost]
        [Authorize(Roles = "User,Admin,SysAdmin")]
        public async Task<ActionResult<SimCard>> PostSimCard(SimCard simCard)
        {
            if (simCard.StartDate == default(DateTime))
            {
                simCard.StartDate = DateTime.UtcNow;
            }
            if (simCard.EndDate == default(DateTime))
            {
                simCard.EndDate = DateTime.UtcNow.AddYears(1); // Default to 1 year from now
            }

            _context.SimCards.Add(simCard);
            await _context.SaveChangesAsync();

            await _movementLogger.LogAsync(User, "SimCard", simCard.Id, simCard.SimNumber, "Created",
                StockMovementLogger.BuildDiff(("Location", null, simCard.Location), ("Status", null, simCard.Status)));
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSimCard), new { id = simCard.Id }, simCard);
        }

        // PUT: api/SimCards/5
        [HttpPut("{id}")]
        [Authorize(Roles = "User,Admin,SysAdmin")]
        public async Task<IActionResult> PutSimCard(int id, SimCard simCard)
        {
            if (id != simCard.Id)
            {
                return BadRequest();
            }

            var existing = await _context.SimCards.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
            if (existing == null)
            {
                return NotFound();
            }

            var changes = StockMovementLogger.BuildDiff(
                ("Location", existing.Location, simCard.Location),
                ("Status", existing.Status, simCard.Status),
                ("Device", existing.Device, simCard.Device),
                ("Allocated", existing.Allocated, simCard.Allocated));

            if (changes != null)
            {
                await _movementLogger.LogAsync(User, "SimCard", id, simCard.SimNumber ?? existing.SimNumber, "Updated", changes);
            }

            _context.Entry(simCard).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SimCardExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/SimCards/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "SysAdmin")]
        public async Task<IActionResult> DeleteSimCard(int id)
        {
            var simCard = await _context.SimCards.FindAsync(id);
            if (simCard == null)
            {
                return NotFound();
            }

            _context.SimCards.Remove(simCard);
            await _movementLogger.LogAsync(User, "SimCard", id, simCard.SimNumber, "Deleted",
                StockMovementLogger.BuildDiff(("Location", simCard.Location, null), ("Status", simCard.Status, null)));
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/SimCards/allocate
        [HttpPost("allocate")]
        // [Authorize(Roles = "Admin,SysAdmin")]
        public async Task<IActionResult> AllocateSimCard(AllocateSimCardDto allocateDto)
        {
            var simCard = await _context.SimCards.FindAsync(allocateDto.SimCardId);

            if (simCard == null)
            {
                return NotFound($"Sim Card with ID {allocateDto.SimCardId} not found.");
            }

            var changes = StockMovementLogger.BuildDiff(
                ("Allocated", simCard.Allocated, allocateDto.Allocated),
                ("Location", simCard.Location, allocateDto.Location),
                ("Device", simCard.Device, allocateDto.Device),
                ("Status", simCard.Status, allocateDto.Status));

            simCard.Allocated = allocateDto.Allocated;
            simCard.Location = allocateDto.Location;
            simCard.Device = allocateDto.Device;
            simCard.Status = allocateDto.Status;

            if (changes != null)
            {
                await _movementLogger.LogAsync(User, "SimCard", simCard.Id, simCard.SimNumber, "Allocated", changes);
            }

            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool SimCardExists(int id)
        {
            return _context.SimCards.Any(e => e.Id == id);
        }
    }
}