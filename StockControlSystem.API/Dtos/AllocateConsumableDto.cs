namespace StockControlSystem.API.Dtos
{
    public class AllocateConsumableDto
    {
        public string ConsumableType { get; set; }
        public string SourceLocation { get; set; }
        public string DestinationLocation { get; set; }
        public int Quantity { get; set; }
        public string User { get; set; }
        public string Description { get; set; }
    }
}
