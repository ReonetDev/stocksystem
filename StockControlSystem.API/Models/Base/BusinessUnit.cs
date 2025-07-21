using System.ComponentModel.DataAnnotations;

namespace StockControlSystem.API.Models{

    public class BusinessUnit
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Active { get; set; }
    }
}