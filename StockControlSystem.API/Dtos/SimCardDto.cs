using System;

namespace StockControlSystem.API.Dtos
{
    public class SimCardDto
    {
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