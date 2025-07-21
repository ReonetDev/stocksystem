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
    public class SitesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SitesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Sites
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SiteDto>>> GetSites()
        {
            return await _context.Sites.Include(s => s.Client).Include(s => s.Region)
                .Select(s => new SiteDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    ClientId = s.Client != null ? s.Client.Id : 0,
                    Client = s.Client != null ? new ClientDto { Id = s.Client.Id, Name = s.Client.Name } : null,
                    RegionId = s.Region != null ? s.Region.Id : 0,
                    Region = s.Region != null ? new RegionDto { Id = s.Region.Id, Name = s.Region.Name } : null
                })
                .ToListAsync();
        }

        // GET: api/Sites/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SiteDto>> GetSite(int id)
        {
            var site = await _context.Sites.Include(s => s.Client).Include(s => s.Region).FirstOrDefaultAsync(s => s.Id == id);

            if (site == null)
            {
                return NotFound();
            }

            var siteDto = new SiteDto
            {
                Id = site.Id,
                Name = site.Name,
                ClientId = site.Client != null ? site.Client.Id : 0,
                Client = site.Client != null ? new ClientDto { Id = site.Client.Id, Name = site.Client.Name } : null,
                RegionId = site.Region != null ? site.Region.Id : 0,
                Region = site.Region != null ? new RegionDto { Id = site.Region.Id, Name = site.Region.Name } : null
            };

            return siteDto;
        }

        // PUT: api/Sites/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSite(int id, SiteDto siteDto)
        {
            if (id != siteDto.Id)
            {
                return BadRequest();
            }

            var site = await _context.Sites.FindAsync(id);
            if (site == null)
            {
                return NotFound();
            }

            site.Name = siteDto.Name;
            _context.Entry(site).Property("ClientId").CurrentValue = siteDto.ClientId;
            _context.Entry(site).Property("RegionId").CurrentValue = siteDto.RegionId;

            _context.Entry(site).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SiteExists(id))
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

        // POST: api/Sites
        [HttpPost]
        public async Task<ActionResult<Site>> PostSite(SiteDto siteDto)
        {
            var site = new Site
            {
                Name = siteDto.Name,
            };

            _context.Entry(site).Property("ClientId").CurrentValue = siteDto.ClientId;
            _context.Entry(site).Property("RegionId").CurrentValue = siteDto.RegionId;

            _context.Sites.Add(site);
            await _context.SaveChangesAsync();

            // Reload the site with its Client and Region to return the full object
            await _context.Entry(site).Reference(s => s.Client).LoadAsync();
            await _context.Entry(site).Reference(s => s.Region).LoadAsync();

            return CreatedAtAction("GetSite", new { id = site.Id }, new SiteDto
            {
                Id = site.Id,
                Name = site.Name,
                ClientId = site.Client != null ? site.Client.Id : 0,
                Client = site.Client != null ? new ClientDto { Id = site.Client.Id, Name = site.Client.Name } : null,
                RegionId = site.Region != null ? site.Region.Id : 0,
                Region = site.Region != null ? new RegionDto { Id = site.Region.Id, Name = site.Region.Name } : null
            });
        }

        private bool SiteExists(int id)
        {
            return _context.Sites.Any(e => e.Id == id);
        }
    }
}
