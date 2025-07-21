
using System;
using System.ComponentModel.DataAnnotations;

namespace StockControlSystem.API.Models
{
    public class SerialStock
    {
        [Key]
        public int Id { get; set; }
        public string Supplier { get; set; }
        public string SerialNumber { get; set; }
        public string Description { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
        public string Status { get; set; }
        public string Note { get; set; }
        public string Size { get; set; }
        public string Location { get; set; }
        public DateTime DateTime { get; set; }
    }
}
