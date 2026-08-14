using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Data;
using StockControlSystem.API.Models;

namespace StockControlSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,SysAdmin")]
    public class StockMovementLogsController : ControllerBase
    {
        private const int MaxResults = 500;

        private readonly ApplicationDbContext _context;

        public StockMovementLogsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StockMovementLog>>> GetLogs(
            [FromQuery] string? entityType,
            [FromQuery] string? action,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var query = _context.StockMovementLogs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(entityType))
            {
                query = query.Where(l => l.EntityType == entityType);
            }

            if (!string.IsNullOrWhiteSpace(action))
            {
                query = query.Where(l => l.Action == action);
            }

            if (from.HasValue)
            {
                query = query.Where(l => l.Timestamp >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(l => l.Timestamp <= to.Value);
            }

            var logs = await query
                .OrderByDescending(l => l.Timestamp)
                .Take(MaxResults)
                .ToListAsync();

            return logs;
        }
    }
}
