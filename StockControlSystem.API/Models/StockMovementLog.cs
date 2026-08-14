
using System;
using System.ComponentModel.DataAnnotations;

namespace StockControlSystem.API.Models
{
    public class StockMovementLog
    {
        [Key]
        public int Id { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public string? ItemIdentifier { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? Changes { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
