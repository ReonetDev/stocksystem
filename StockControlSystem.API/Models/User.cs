
using System;
using System.ComponentModel.DataAnnotations;

namespace StockControlSystem.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public byte[] Password { get; set; }
        public DateTime LastLogin { get; set; }
        public string Token { get; set; }
        public string Role { get; set; }
    }
}
