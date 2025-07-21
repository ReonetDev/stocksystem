using Microsoft.AspNetCore.Authorization;
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
    [Authorize]
    public class SerialStockController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SerialStockController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SerialStock>>> GetSerialStock()
        {
            return await _context.SerialStock.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SerialStock>> GetSerialStock(int id)
        {
            var serialStock = await _context.SerialStock.FindAsync(id);

            if (serialStock == null)
            {
                return NotFound();
            }

            return serialStock;
        }

        [HttpGet("bySerialNumber/{serialNumber}")]
        public async Task<ActionResult<SerialStock>> GetSerialStockBySerialNumber(string serialNumber)
        {
            var serialStock = await _context.SerialStock.FirstOrDefaultAsync(s => s.SerialNumber == serialNumber);

            if (serialStock == null)
            {
                return NotFound();
            }

            return serialStock;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,SysAdmin")]
        public async Task<ActionResult<SerialStock>> PostSerialStock(SerialStock serialStock)
        {
            if (serialStock.DateTime == default(DateTime))
            {
                serialStock.DateTime = DateTime.UtcNow;
            }
            _context.SerialStock.Add(serialStock);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSerialStock", new { id = serialStock.Id }, serialStock);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,SysAdmin")]
        public async Task<IActionResult> PutSerialStock(int id, SerialStock serialStock)
        {
            if (id != serialStock.Id)
            {
                return BadRequest();
            }

            _context.Entry(serialStock).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SerialStockExists(id))
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

        [HttpDelete("{id}")]
        // [Authorize(Roles = "SysAdmin")]
        public async Task<IActionResult> DeleteSerialStock(int id)
        {
            var serialStock = await _context.SerialStock.FindAsync(id);
            if (serialStock == null)
            {
                return NotFound();
            }

            _context.SerialStock.Remove(serialStock);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SerialStockExists(int id)
        {
            return _context.SerialStock.Any(e => e.Id == id);
        }
    }
}