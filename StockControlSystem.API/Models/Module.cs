
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StockControlSystem.API.Models
{
    public class Module
    {
        [Key]
        public int Id { get; set; }
        public bool Stock { get; set; }
        public bool SIM { get; set; }
        public bool PRV { get; set; }
        public bool Manage { get; set; }
        public bool System { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}
