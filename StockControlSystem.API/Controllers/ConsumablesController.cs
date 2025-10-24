using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Data;
using StockControlSystem.API.Models;
using StockControlSystem.API.Dtos;

namespace StockControlSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsumablesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ConsumablesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Consumables
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Consumable>>> GetConsumables()
        {
            return await _context.Consumables.ToListAsync();
        }

        // POST: api/Consumables
        [HttpPost]
        public async Task<ActionResult<Consumable>> PostConsumable(ConsumableDto consumableDto)
        {
            try
            {
                var exisitCons = _context.Consumables.Where(x =>
                x.Supplier == consumableDto.Supplier && x.Type == consumableDto.Type && x.Description == consumableDto.Description&&
                x.Location == consumableDto.Location).FirstOrDefault();
            
                if(exisitCons != null){

                    exisitCons.Quantity += consumableDto.Quantity;

                    await _context.SaveChangesAsync();
                    return CreatedAtAction(nameof(GetConsumables), new { id = exisitCons.Id }, exisitCons);
                }
                else{

                    var consumable = new Consumable
                    {
                        Supplier = consumableDto.Supplier,
                        Type = consumableDto.Type,
                        Description = consumableDto.Description,
                        User = consumableDto.User,
                        Location = consumableDto.Location,
                        Quantity = consumableDto.Quantity
                    };

                    _context.Consumables.Add(consumable);
                    await _context.SaveChangesAsync();
                    return CreatedAtAction(nameof(GetConsumables), new { id = consumable.Id }, consumable);
                }
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message.ToString());
            }
            
        }

        // PUT: api/Consumables/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutConsumable(int id, ConsumableDto consumableDto)
        {
            if (id != consumableDto.Id)
            {
                return BadRequest();
            }

            var consumable = await _context.Consumables.FindAsync(id);
            if (consumable == null)
            {
                return NotFound();
            }

            consumable.Supplier = consumableDto.Supplier;
            consumable.Type = consumableDto.Type;
            consumable.Description = consumableDto.Description;
            consumable.User = consumableDto.User;
            consumable.Location = consumableDto.Location;
            consumable.Quantity = consumableDto.Quantity;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Consumables.Any(e => e.Id == id))
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

        // POST: api/Consumables/allocate
        [HttpPost("allocate")]
        public async Task<IActionResult> AllocateConsumable(AllocateConsumableDto allocateDto)
        {
            // Find the consumable at the source location
            var sourceConsumable = await _context.Consumables.FirstOrDefaultAsync(c =>
                c.Type == allocateDto.ConsumableType && c.Description == allocateDto.Description && c.Location == allocateDto.SourceLocation);

            if (sourceConsumable == null)
            {
                return BadRequest($"Consumable type '{allocateDto.ConsumableType}' not found at '{allocateDto.SourceLocation}'.");
            }

            if (sourceConsumable.Quantity < allocateDto.Quantity)
            {
                return BadRequest($"Insufficient quantity. Available: {sourceConsumable.Quantity}.");
            }

            // Update source consumable
            sourceConsumable.Quantity -= allocateDto.Quantity;
            sourceConsumable.User = allocateDto.User; // Update user for the transaction

            // Handle destination consumable
            if (allocateDto.DestinationLocation != "SITE")
            {
                var destinationConsumable = await _context.Consumables.FirstOrDefaultAsync(c =>
                    c.Type == allocateDto.ConsumableType && c.Description == allocateDto.Description && c.Location == allocateDto.DestinationLocation);

                if (destinationConsumable == null)
                {
                    // Create new consumable entry for destination
                    var newConsumable = new Consumable
                    {
                        Supplier = sourceConsumable.Supplier, // Inherit supplier from source
                        Type = allocateDto.ConsumableType,
                        Description = allocateDto.Description, // Use description from DTO
                        User = allocateDto.User,
                        Location = allocateDto.DestinationLocation,
                        Quantity = allocateDto.Quantity
                    };
                    _context.Consumables.Add(newConsumable);
                }
                else
                {
                    // Update existing destination consumable
                    destinationConsumable.Quantity += allocateDto.Quantity;
                    destinationConsumable.User = allocateDto.User; // Update user for the transaction
                }
            }

            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
