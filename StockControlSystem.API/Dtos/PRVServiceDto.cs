using System.Text.Json.Serialization;

namespace StockControlSystem.API.Dtos
{
    public class PRVServiceDto
    {
        public int Id { get; set; }
        public int PRVDeviceId { get; set; }
        public string? SupplyDescription { get; set; }
        [JsonPropertyName("prv_size")]
        public int? PRV_Size { get; set; }
        [JsonPropertyName("prv_make")]
        public string? PRV_Make { get; set; }
        public DateTime? LastServiceDate { get; set; }
        public DateTime? NextServiceDate { get; set; }
        public int? ServiceInterval { get; set; }
        public string? ServiceType { get; set; }
        public string? BusinessUnit { get; set; }
        public string? Client { get; set; }
        public string? Region { get; set; }
        public string? Site { get; set; }
    }
}