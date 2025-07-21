using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Data;
using StockControlSystem.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StockControlSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TechniciansController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TechniciansController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Technicians
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Technician>>> GetTechnicians()
        {
            return await _context.Technicians.ToListAsync();
        }

        // GET: api/Technicians/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Technician>> GetTechnician(int id)
        {
            var technician = await _context.Technicians.FindAsync(id);

            if (technician == null)
            {
                return NotFound();
            }

            return technician;
        }

        // PUT: api/Technicians/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTechnician(int id, Technician technician)
        {
            if (id != technician.Id)
            {
                return BadRequest();
            }

            _context.Entry(technician).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TechnicianExists(id))
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

        // POST: api/Technicians
        [HttpPost]
        public async Task<ActionResult<Technician>> PostTechnician(Technician technician)
        {
            _context.Technicians.Add(technician);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTechnician", new { id = technician.Id }, technician);
        }

        // DELETE: api/Technicians/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTechnician(int id)
        {
            var technician = await _context.Technicians.FindAsync(id);
            if (technician == null)
            {
                return NotFound();
            }

            _context.Technicians.Remove(technician);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TechnicianExists(int id)
        {
            return _context.Technicians.Any(e => e.Id == id);
        }
    }
}
