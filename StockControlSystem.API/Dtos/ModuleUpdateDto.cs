namespace StockControlSystem.API.Dtos
{
    public class ModuleUpdateDto
    {
        public bool Stock { get; set; }
        public bool SIM { get; set; }
        public bool PRV { get; set; }
        public bool Manage { get; set; }
        public bool System { get; set; }
    }
}
