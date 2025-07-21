using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StockControlSystem.API.Models{

    public class Client
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Active { get; set; }
        
        [ForeignKey("BusinessUnitId")]
        public BusinessUnit BusinessUnit { get; set; }
    }
}