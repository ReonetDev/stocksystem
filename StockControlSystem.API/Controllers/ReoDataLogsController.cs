using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Data;
using StockControlSystem.API.Models.External;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StockControlSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReoDataLogsController : ControllerBase
    {
        private readonly ExternalDbContext _context;

        public ReoDataLogsController(ExternalDbContext context)
        {
            _context = context;
        }

        // GET: api/ReoDataLogs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReoDataLog>>> GetReoDataLogs([FromQuery] string? transducer, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            if (string.IsNullOrEmpty(transducer))
            {
                return new List<ReoDataLog>();
            }

            return await _context.ReoDataLogs
                .Where(r => r.MeterNumber == transducer &&
                            (!startDate.HasValue || r.LogDate >= startDate.Value) &&
                            (!endDate.HasValue || r.LogDate <= endDate.Value))
                .ToListAsync();
        }
    }
}
