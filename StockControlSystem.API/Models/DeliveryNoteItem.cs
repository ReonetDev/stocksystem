namespace StockControlSystem.API.Models
{
    public class DeliveryNoteItem
    {
        public int Id { get; set; }
        public int DeliveryNoteId { get; set; }
        public DeliveryNote DeliveryNote { get; set; }
        public int SerialStockId { get; set; }
        public SerialStock SerialStock { get; set; }
    }
}
