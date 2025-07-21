using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Data;
using StockControlSystem.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using StockControlSystem.API.Dtos;

namespace StockControlSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClientsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Clients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientDto>>> GetClients()
        {
            return await _context.Clients.Include(c => c.BusinessUnit)
                .Select(c => new ClientDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    BusinessUnitId = c.BusinessUnit != null ? c.BusinessUnit.Id : 0,
                    BusinessUnit = new BusinessUnitDto
                    {
                        Id = c.BusinessUnit.Id,
                        Name = c.BusinessUnit.Name
                    }
                })
                .ToListAsync();
        }

        // GET: api/Clients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDto>> GetClient(int id)
        {
            var client = await _context.Clients.Include(c => c.BusinessUnit).FirstOrDefaultAsync(c => c.Id == id);

            if (client == null)
            {
                return NotFound();
            }

            var clientDto = new ClientDto
            {
                Id = client.Id,
                Name = client.Name,
                BusinessUnitId = client.BusinessUnit != null ? client.BusinessUnit.Id : 0,
                BusinessUnit = new BusinessUnitDto
                {
                    Id = client.BusinessUnit.Id,
                    Name = client.BusinessUnit.Name
                }
            };

            return clientDto;
        }

        // PUT: api/Clients/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutClient(int id, ClientDto clientDto)
        {
            if (id != clientDto.Id)
            {
                return BadRequest();
            }

            var client = await _context.Clients.FindAsync(id);
            if (client == null)
            {
                return NotFound();
            }

            client.Name = clientDto.Name;
            _context.Entry(client).Property("BusinessUnitId").CurrentValue = clientDto.BusinessUnitId;

            _context.Entry(client).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClientExists(id))
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

        // POST: api/Clients
        [HttpPost]
        public async Task<ActionResult<Client>> PostClient(ClientDto clientDto)
        {
            var client = new Client
            {
                Name = clientDto.Name,
            };

            _context.Entry(client).Property("BusinessUnitId").CurrentValue = clientDto.BusinessUnitId;

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            // Reload the client with its BusinessUnit to return the full object
            await _context.Entry(client).Reference(c => c.BusinessUnit).LoadAsync();

            return CreatedAtAction("GetClient", new { id = client.Id }, new ClientDto
            {
                Id = client.Id,
                Name = client.Name,
                BusinessUnitId = client.BusinessUnit != null ? client.BusinessUnit.Id : 0,
                BusinessUnit = new BusinessUnitDto
                {
                    Id = client.BusinessUnit.Id,
                    Name = client.BusinessUnit.Name
                }
            });
        }

        private bool ClientExists(int id)
        {
            return _context.Clients.Any(e => e.Id == id);
        }
    }
}
