using System;
using System.ComponentModel.DataAnnotations;

namespace StockControlSystem.API.Models
{
    public class Consumable
    {
        public int Id { get; set; }
        public string? Supplier { get; set; }
        public string? Type { get; set; }
        public string? Description { get; set; }
        public string? User { get; set; }
        public string? Location { get; set; }
        public int Quantity { get; set; }
    }
}
