using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StockControlSystem.API.Models{

    public class Site
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Active { get; set; }
        
        [ForeignKey("ClientId")]
        public Client Client { get; set; }
        
        [ForeignKey("RegionId")]
        public Region Region { get; set; }
        
    }
}