using System.ComponentModel.DataAnnotations;

namespace StockControlSystem.API.Models.External
{
    public class ReoMeter
    {
        [Key]
        public int ReoMeterId { get; set; }
        public int ReoDeviceId { get; set; }
        public string? MeterNumber { get; set; }
        public int? ChannelNumber { get; set; }
        public string? ChanUnitOfMeasure { get; set; }
        public string? Description { get; set; }
        public string? MeterType { get; set; }
        public bool Active { get; set; }
        public bool IsPressure { get; set; }
        public string? ParentChildLinkID { get; set; }
        public double? PulseWeight { get; set; }
    }
}