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
    public class BusinessUnitsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BusinessUnitsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/BusinessUnits
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BusinessUnit>>> GetBusinessUnits()
        {
            return await _context.BusinessUnits.ToListAsync();
        }

        // GET: api/BusinessUnits/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BusinessUnit>> GetBusinessUnit(int id)
        {
            var businessUnit = await _context.BusinessUnits.FindAsync(id);

            if (businessUnit == null)
            {
                return NotFound();
            }

            return businessUnit;
        }

        // PUT: api/BusinessUnits/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBusinessUnit(int id, BusinessUnit businessUnit)
        {
            if (id != businessUnit.Id)
            {
                return BadRequest();
            }

            _context.Entry(businessUnit).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BusinessUnitExists(id))
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

        // POST: api/BusinessUnits
        [HttpPost]
        public async Task<ActionResult<BusinessUnit>> PostBusinessUnit(BusinessUnit businessUnit)
        {
            _context.BusinessUnits.Add(businessUnit);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetBusinessUnit", new { id = businessUnit.Id }, businessUnit);
        }

        private bool BusinessUnitExists(int id)
        {
            return _context.BusinessUnits.Any(e => e.Id == id);
        }
    }
}
