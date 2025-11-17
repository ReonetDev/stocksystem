namespace StockControlSystem.API.Models
{
    public class MobileDevice
    {
        public int Id { get; set; }
        public string? Make { get; set; }
        public string? Model { get; set; }
        public string? Type { get; set; }
        public string? SerialNumber { get; set; }
        public string? IMEI { get; set; }
        public string? IMEI2 { get; set; }
        public string? Status { get; set; }
        public string? Allocation { get; set; }
    }
}
