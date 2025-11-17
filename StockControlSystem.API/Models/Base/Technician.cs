using System.ComponentModel.DataAnnotations;

namespace StockControlSystem.API.Models{

    public class Technician
    {
        [Key]
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public bool Active { get; set; }
    }
}