using System;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Data;
using StockControlSystem.API.Models;

namespace StockControlSystem.API.Services
{
    public class StockMovementLogger
    {
        private readonly ApplicationDbContext _context;

        public StockMovementLogger(ApplicationDbContext context)
        {
            _context = context;
        }

        public static string? BuildDiff(params (string Name, object? OldVal, object? NewVal)[] fields)
        {
            var sb = new StringBuilder();
            foreach (var field in fields)
            {
                var oldVal = field.OldVal?.ToString() ?? string.Empty;
                var newVal = field.NewVal?.ToString() ?? string.Empty;
                if (oldVal == newVal)
                {
                    continue;
                }

                if (sb.Length > 0)
                {
                    sb.Append("; ");
                }
                sb.Append(field.Name).Append(": ").Append(oldVal).Append(" -> ").Append(newVal);
            }

            return sb.Length > 0 ? sb.ToString() : null;
        }

        public async Task LogAsync(ClaimsPrincipal user, string entityType, int entityId, string? itemIdentifier, string action, string? changes)
        {
            var email = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? userId = null;
            string? userName = email;

            if (!string.IsNullOrEmpty(email))
            {
                var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (dbUser != null)
                {
                    userId = dbUser.Id;
                    userName = $"{dbUser.FirstName} {dbUser.LastName}".Trim();
                }
            }

            _context.StockMovementLogs.Add(new StockMovementLog
            {
                EntityType = entityType,
                EntityId = entityId,
                ItemIdentifier = itemIdentifier,
                Action = action,
                Changes = changes,
                UserId = userId,
                UserName = userName,
                Timestamp = DateTime.UtcNow
            });
        }
    }
}
