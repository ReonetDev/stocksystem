
using System;
using System.Collections.Generic;

namespace StockControlSystem.API.Dtos
{
    public class DeliveryNoteDto
    {
        public DateTime DateTime { get; set; }
        public string Destination { get; set; }
        public string Comments { get; set; }
        public List<DeliveryNoteItemDto> Items { get; set; }
    }
}
