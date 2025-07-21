
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
    public class PRVServicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly AzureBlobService _azureBlobService;

        public PRVServicesController(ApplicationDbContext context, AzureBlobService azureBlobService)
        {
            _context = context;
            _azureBlobService = azureBlobService;
        }

        // GET: api/PRVServices
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PRVServiceDto>>> GetPRVServices([FromQuery] int? prvDeviceId = null)
        {
            var query = _context.PRVServices.AsQueryable();

            if (prvDeviceId.HasValue)
            {
                query = query.Where(s => s.PRVDevice.Id == prvDeviceId.Value);
            }

            var prvServices = await query
                .Include(s => s.PRVDevice)
                    .ThenInclude(pd => pd.Site)
                        .ThenInclude(s => s.Client)
                            .ThenInclude(c => c.BusinessUnit)
                .Include(s => s.PRVDevice)
                    .ThenInclude(pd => pd.Site)
                        .ThenInclude(s => s.Region)
                .Select(s => new PRVServiceDto
                {
                    Id = s.Id,
                    PRVDeviceId = s.PRVDevice.Id,
                    SupplyDescription = s.SupplyDescription,
                    PRV_Size = s.PRVDevice.PRV_Size,
                    PRV_Make = s.PRVDevice.PRV_Make,
                    LastServiceDate = s.LastServiceDate,
                    NextServiceDate = s.NextServiceDate,
                    ServiceInterval = s.ServiceInterval,
                    ServiceType = s.ServiceType,
                    BusinessUnit = s.PRVDevice.Site.Client.BusinessUnit.Name,
                    Client = s.PRVDevice.Site.Client.Name,
                    Region = s.PRVDevice.Site.Region.Name,
                    Site = s.PRVDevice.Site.Name
                })
                .ToListAsync();

            return Ok(prvServices);
        }

        // GET: api/PRVServices/unscheduled
        [HttpGet("unscheduled")]
        public async Task<ActionResult<IEnumerable<PRVDevice>>> GetUnscheduledPRVDevices()
        {
            var scheduledIds = await _context.PRVServices.Select(s => s.PRVDevice.Id).ToListAsync();
            return await _context.PRVDevices
                .Include(p => p.Site)
                    .ThenInclude(s => s.Client)
                        .ThenInclude(c => c.BusinessUnit)
                .Include(p => p.Site)
                    .ThenInclude(s => s.Region)
                .Where(p => !scheduledIds.Contains(p.Id))
                .ToListAsync();
        }
    // POST: api/PRVServices
        [HttpPost]
        public async Task<ActionResult<PRVService>> PostPRVService(PRVServiceDto prvServiceDto)
        {
            var prvDevice = await _context.PRVDevices.FindAsync(prvServiceDto.PRVDeviceId);
            if (prvDevice == null)
            {
                return BadRequest("Invalid PRV Device ID");
            }

            var lastServiceDate = prvServiceDto.NextServiceDate?.AddMonths(-prvServiceDto.ServiceInterval ?? 0);

            var prvService = new PRVService
            {
                PRVDevice = prvDevice,
                SupplyDescription = prvDevice.SupplyDescription,
                PRV_Size = prvDevice.PRV_Size,
                PRV_Make = prvDevice.PRV_Make,
                LastServiceDate = (DateTime)lastServiceDate,
                NextServiceDate = (DateTime)prvServiceDto.NextServiceDate,
                ServiceInterval = prvServiceDto.ServiceInterval,
                ServiceType = "Scheduled", // Default value,
                Site = prvDevice.Site
            };

            _context.PRVServices.Add(prvService);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPRVServices), new { id = prvService.Id }, prvService);
        }

        // PUT: api/PRVServices/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPRVService(int id, [FromForm] PRVServiceUpdateDto prvServiceDto)
        {
            if (id != prvServiceDto.Id)
            {
                return BadRequest();
            }

            var existingService = await _context.PRVServices.FindAsync(id);
            if (existingService == null)
            {
                return NotFound();
            }

            existingService.NextServiceDate = (DateTime)prvServiceDto.NextServiceDate;
            existingService.ServiceInterval = prvServiceDto.ServiceInterval;
            existingService.ServiceType = prvServiceDto.ServiceType;
            existingService.LastServiceDate = (DateTime)prvServiceDto.LastServiceDate;

            if (prvServiceDto.File != null && prvServiceDto.File.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(prvServiceDto.File.FileName);
                using (var stream = prvServiceDto.File.OpenReadStream())
                {
                    var fileUrl = await _azureBlobService.UploadFileAsync(fileName, stream, prvServiceDto.File.ContentType);
                    var serviceDocument = new ServiceDocument
                    {
                        PRVServiceId = existingService.Id,
                        FileName = prvServiceDto.File.FileName,
                        FilePath = fileUrl,
                        AttachmentType = prvServiceDto.AttachmentType,
                        UploadDate = DateTime.UtcNow
                    };
                    _context.ServiceDocuments.Add(serviceDocument);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PRVServiceExists(id))
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

        // GET: api/PRVServices/{id}/documents
        [HttpGet("{id}/documents")]
        public async Task<ActionResult<IEnumerable<ServiceDocumentDto>>> GetPRVServiceDocuments(int id)
        {
            var documents = await _context.ServiceDocuments
                .Where(d => d.PRVServiceId == id)
                .Select(d => new ServiceDocumentDto
                {
                    Id = d.Id,
                    PRVServiceId = d.PRVServiceId,
                    FileName = d.FileName,
                    FilePath = d.FilePath,
                    AttachmentType = d.AttachmentType,
                    UploadDate = d.UploadDate
                })
                .ToListAsync();

            if (documents == null)
            {
                return NotFound();
            }

            return Ok(documents);
        }

        private bool PRVServiceExists(int id)
        {
            return _context.PRVServices.Any(e => e.Id == id);
        }

        // GET: api/PRVServices/prvdevices
        [HttpGet("prvdevices")]
        public async Task<ActionResult<IEnumerable<PRVDeviceDetailDto>>> GetPRVDevices()
        {
            var prvDevices = await _context.PRVDevices
                .Include(p => p.Site)
                    .ThenInclude(s => s.Client)
                        .ThenInclude(c => c.BusinessUnit)
                .Include(p => p.Site)
                    .ThenInclude(s => s.Region)
                .Select(p => new PRVDeviceDetailDto
                {
                    Id = p.Id,
                    SupplyDescription = p.SupplyDescription,
                    PRV_Size = p.PRV_Size,
                    PRV_Make = p.PRV_Make,
                    BusinessUnit = p.Site.Client.BusinessUnit.Name,
                    Client = p.Site.Client.Name,
                    Region = p.Site.Region.Name,
                    Site = p.Site.Name
                })
                .ToListAsync();

            return Ok(prvDevices);
        }
    }
}
