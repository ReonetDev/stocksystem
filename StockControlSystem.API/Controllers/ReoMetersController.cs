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
    public class ReoMetersController : ControllerBase
    {
        private readonly ExternalDbContext _context;

        public ReoMetersController(ExternalDbContext context)
        {
            _context = context;
        }

        // GET: api/ReoMeters
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReoMeter>>> GetReoMeters()
        {
            return await _context.ReoMeters.Where(x=>x.Active == true && x.ChanUnitOfMeasure.ToLower() == "bar").ToListAsync();
        }
    }
}
