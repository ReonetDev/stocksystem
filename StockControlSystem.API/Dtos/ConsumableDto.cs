namespace StockControlSystem.API.Dtos
{
    public class ConsumableDto
    {
        public int Id { get; set; }
        public string Supplier { get; set; }
        public string Type { get; set; }
        public string Description { get; set; }
        public string User { get; set; }
        public string Location { get; set; }
        public int Quantity { get; set; }
    }
}
