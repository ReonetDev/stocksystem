namespace StockControlSystem.API.Dtos
{
    public class AllocateSimCardDto
    {
        public int SimCardId { get; set; }
        public string Location { get; set; }
        public string Device { get; set; }
        public bool Allocated { get; set; }
        public string Status { get; set; }
    }
}