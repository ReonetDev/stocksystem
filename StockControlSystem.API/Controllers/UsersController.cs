using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Data;
using StockControlSystem.API.Dtos;
using StockControlSystem.API.Models;
using StockControlSystem.API.Services;
using System;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace StockControlSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TokenService _tokenService;

        public UsersController(ApplicationDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
            AddDefaultUser();
        }

        [HttpPost("register")]
        [AllowAnonymous] // Allow registration without token for initial setup, but add role check for subsequent registrations
        public async Task<IActionResult> Register(UserForRegisterDto userForRegisterDto)
        {
            // Check if the user is authenticated and has Admin or SysAdmin role
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (currentUserRole != "Admin" && currentUserRole != "SysAdmin")
            {
                if (userForRegisterDto.RegistrationCode != "Reonet@2025")
                {
                    return BadRequest("Invalid registration code.");
                }
            }

            if (await _context.Users.AnyAsync(u => u.Email == userForRegisterDto.Email))
            {
                return BadRequest("User already exists.");
            }

            using (var sha256 = SHA256.Create())
            {
                var user = new User
                {
                    FirstName = userForRegisterDto.FirstName,
                    LastName = userForRegisterDto.LastName,
                    Email = userForRegisterDto.Email,
                    Password = sha256.ComputeHash(Encoding.UTF8.GetBytes(userForRegisterDto.Password)),
                    Role = userForRegisterDto.Role ?? "User", // Use provided role if available, otherwise default to "User"
                    LastLogin = DateTime.UtcNow.AddHours(2) // Set LastLogin to registration date in GMT+2
                };
                var token = _tokenService.GenerateToken(user);
                user.Token = token;
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var module = new Module
                {
                    User = user,
                    Stock = userForRegisterDto.Stock,
                    SIM = userForRegisterDto.SIM,
                    PRV = userForRegisterDto.PRV,
                    Manage = userForRegisterDto.Manage,
                    System = userForRegisterDto.System
                };
                _context.Modules.Add(module);
                await _context.SaveChangesAsync();

                return Ok(new { Token = user.Token, Role = user.Role });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserForLoginDto userForLoginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userForLoginDto.Email);

            if (user == null || !VerifyPassword(userForLoginDto.Password, user.Password))
            {
                return Unauthorized();
            }

            var token = _tokenService.GenerateToken(user);
            user.LastLogin = DateTime.UtcNow.AddHours(2);
            await _context.SaveChangesAsync();

            var defaultPasswordHash = "e7cf3ef4f17c3999a94f2c6f612e8a888e5b1026878e4e19398b23bd38ec221a";
            var forcePasswordChange = BitConverter.ToString(user.Password).Replace("-", "").ToLower() == defaultPasswordHash;

            return Ok(new { Token = token, Role = user.Role, ForcePasswordChange = forcePasswordChange });
        }

        // [Authorize]
        [HttpGet("validate-token")]
        public IActionResult ValidateToken()
        {
            return Ok();
        }

        // [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userEmail = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userEmail == null)
            {
                return Unauthorized();
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new { user.FirstName, user.LastName, user.Email, user.Id });
        }

        // [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UserForUpdateDto userForUpdateDto)
        {
            var userEmail = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userEmail == null)
            {
                return Unauthorized();
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null)
            {
                return NotFound();
            }

            user.FirstName = userForUpdateDto.FirstName;
            user.LastName = userForUpdateDto.LastName;
            
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok("Profile updated successfully.");
        }

        // [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var userEmail = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userEmail == null)
            {
                return Unauthorized();
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null)
            {
                return NotFound();
            }

            if (!VerifyPassword(changePasswordDto.CurrentPassword, user.Password))
            {
                return BadRequest("Invalid current password.");
            }

            if (changePasswordDto.NewPassword != changePasswordDto.ConfirmNewPassword)
            {
                return BadRequest("New password and confirmation do not match.");
            }

            using (var sha256 = SHA256.Create())
            {
                user.Password = sha256.ComputeHash(Encoding.UTF8.GetBytes(changePasswordDto.NewPassword));
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok("Password changed successfully.");
        }

        private bool VerifyPassword(string enteredPassword, byte[] storedPassword)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedEnteredPassword = sha256.ComputeHash(Encoding.UTF8.GetBytes(enteredPassword));
                return hashedEnteredPassword.SequenceEqual(storedPassword);
            }
        }

        // [Authorize(Roles = "Admin,SysAdmin")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            return await _context.Users.Select(u => new User { Id = u.Id, FirstName = u.FirstName, LastName = u.LastName, Email = u.Email, Role = u.Role, LastLogin = u.LastLogin }).ToListAsync();
        }

        // [Authorize(Roles = "Admin,SysAdmin")]
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return new User { Id = user.Id, FirstName = user.FirstName, LastName = user.LastName, Email = user.Email, Role = user.Role, LastLogin = user.LastLogin };
        }

        // [Authorize(Roles = "Admin,SysAdmin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserForUpdateDto userForUpdateDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.FirstName = userForUpdateDto.FirstName;
            user.LastName = userForUpdateDto.LastName;
            user.Email = userForUpdateDto.Email;
            user.Role = userForUpdateDto.Role;

            if (!string.IsNullOrEmpty(userForUpdateDto.Password))
            {
                using (var sha256 = SHA256.Create())
                {
                    user.Password = sha256.ComputeHash(Encoding.UTF8.GetBytes(userForUpdateDto.Password));
                }
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [Authorize(Roles = "SysAdmin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }

        // [Authorize(Roles = "Admin,SysAdmin,User")]
        [HttpGet("{id}/modules")]
        public async Task<ActionResult<Module>> GetUserModules(int id)
        {
            var module = await _context.Modules.FirstOrDefaultAsync(m => m.User.Id == id);

            if (module == null)
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null) {
                    return NotFound();
                }
                var newModule = new Module { User = user };
                _context.Modules.Add(newModule);
                await _context.SaveChangesAsync();
                return newModule;
            }

            return module;
        }

        [Authorize(Roles = "Admin,SysAdmin")]
        [HttpPut("{id}/modules")]
        public async Task<IActionResult> UpdateUserModules(int id, ModuleUpdateDto moduleDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var userModule = await _context.Modules.FirstOrDefaultAsync(m => m.User.Id == id);
            if (userModule == null)
            {
                userModule = new Module { User = user };
                _context.Modules.Add(userModule);
            }

            userModule.Stock = moduleDto.Stock;
            userModule.SIM = moduleDto.SIM;
            userModule.PRV = moduleDto.PRV;
            userModule.Manage = moduleDto.Manage;
            userModule.System = moduleDto.System;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private void AddDefaultUser()
        {
            if (!_context.Users.Any(u => u.Email == "dev@reonet.co.za"))
            {
                using (var sha256 = SHA256.Create())
                {
                    var user = new User
                    {
                        FirstName = "Reonet",
                        LastName = "Dev",
                        Email = "dev@reonet.co.za",
                        Password = sha256.ComputeHash(Encoding.UTF8.GetBytes("DevTest123")),
                        LastLogin = DateTime.UtcNow.AddHours(2),
                        Role = "SysAdmin"
                    };
                    var token = _tokenService.GenerateToken(user);
                    user.Token = token;
                    
                    _context.Users.Add(user);
                    _context.SaveChanges();
                }
            }
        }
    }
}
