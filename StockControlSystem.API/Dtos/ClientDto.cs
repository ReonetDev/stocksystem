namespace StockControlSystem.API.Dtos
{
    public class ClientDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int BusinessUnitId { get; set; }
        public BusinessUnitDto BusinessUnit { get; set; }
    }
}