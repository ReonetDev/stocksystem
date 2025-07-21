namespace StockControlSystem.API.Dtos
{
    public class SiteDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ClientId { get; set; }
        public int RegionId { get; set; }
        public ClientDto? Client { get; set; }
        public RegionDto? Region { get; set; }
    }
}