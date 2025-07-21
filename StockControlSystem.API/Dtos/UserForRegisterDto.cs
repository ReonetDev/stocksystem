
namespace StockControlSystem.API.Dtos
{
    public class UserForRegisterDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string RegistrationCode { get; set; }
        public string Role { get; set; }
        public bool Stock { get; set; }
        public bool SIM { get; set; }
        public bool PRV { get; set; }
        public bool Manage { get; set; }
        public bool System { get; set; }
    }
}
