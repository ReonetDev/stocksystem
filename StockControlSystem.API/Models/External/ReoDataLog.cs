using System;
using System.ComponentModel.DataAnnotations;

namespace StockControlSystem.API.Models.External
{
    public class ReoDataLog
    {
        [Key]
        public int Id { get; set; }
        public int ReoMeterId { get; set; }
        public int? DatalogId { get; set; }
        public string MeterNumber { get; set; }
        public int? ChannelNumber { get; set; }
        public string ChanUnitOfMeasure { get; set; }
        public int DeviceIndex { get; set; }
        public string Description { get; set; }
        public string DtSource { get; set; }
        public int? DtSourceRecId { get; set; }
        public DateTime LogDate { get; set; }
        public double LogReading { get; set; }
        public double PulseCount { get; set; }
        public double PulseWeight { get; set; }
        public double? Pressure { get; set; }
        public double? Consumption { get; set; }
        public bool? Interpolated { get; set; }
        public double? UpdatedConsumption { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

    }
}