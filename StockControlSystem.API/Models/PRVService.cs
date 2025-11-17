using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StockControlSystem.API.Models{
    
    public class PRVService{
        [Key]
        public int Id { get; set; }
        public string? SupplyDescription { get; set; }
        public int? PRV_Size { get; set; }
        public string? PRV_Make { get; set; }
        public DateTime LastServiceDate { get; set; }
        public DateTime NextServiceDate { get; set; }
        public int? ServiceInterval { get; set; }
        public string? ServiceType { get; set; }
        
        [ForeignKey("SiteId")]
        public Site? Site { get; set; }
        
        [ForeignKey("PRVDeviceId")]
        public PRVDevice? PRVDevice { get; set; }
    }
}