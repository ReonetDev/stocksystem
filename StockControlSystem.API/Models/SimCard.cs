using System;
using System.ComponentModel.DataAnnotations;

namespace StockControlSystem.API.Models
{
    public class SimCard
    {
        [Key]
        public int Id { get; set; }
        public string Network { get; set; }
        public string Type { get; set; }
        public string SimNumber { get; set; }
        public string Pin { get; set; }
        public string PUK { get; set; }
        public string MSISDN { get; set; }
        public DateTime StartDate { get; set; }
        public string Period { get; set; }
        public DateTime EndDate { get; set; }
        public bool Allocated { get; set; }
        public string Location { get; set; }
        public string Device { get; set; }
        public string Status { get; set; }
    }
}