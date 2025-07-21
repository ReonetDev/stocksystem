using System;
using System.Collections.Generic;

namespace StockControlSystem.API.Models
{
    public class DeliveryNote
    {
        public int Id { get; set; }
        public string DelNoteNumber { get; set; }
        public DateTime DateTime { get; set; }
        public string Destination { get; set; }
        public string Comments { get; set; }
        public ICollection<DeliveryNoteItem> Items { get; set; }
    }
}
