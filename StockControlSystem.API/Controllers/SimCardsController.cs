using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Data;
using StockControlSystem.API.Models;
using StockControlSystem.API.Dtos;
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

        public SimCardsController(ApplicationDbContext context)
        {
            _context = context;
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

            simCard.Allocated = allocateDto.Allocated;
            simCard.Location = allocateDto.Location;
            simCard.Device = allocateDto.Device;
            simCard.Status = allocateDto.Status;

            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool SimCardExists(int id)
        {
            return _context.SimCards.Any(e => e.Id == id);
        }
    }
}