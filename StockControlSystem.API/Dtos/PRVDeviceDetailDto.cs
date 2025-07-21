namespace StockControlSystem.API.Dtos
{
    public class PRVDeviceDetailDto
    {
        public int Id { get; set; }
        public string SupplyDescription { get; set; }
        public int? PRV_Size { get; set; }
        public string? PRV_Make { get; set; }
        public string? BusinessUnit { get; set; }
        public string? Client { get; set; }
        public string? Region { get; set; }
        public string? Site { get; set; }
    }
}