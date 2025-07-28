using Microsoft.AspNetCore.Mvc;
using StockControlSystem.API.Models;
using StockControlSystem.API.Data;
using System.Collections.Generic;
using System.Linq;

namespace StockControlSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DevicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DevicesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Devices
        [HttpGet]
        public ActionResult<IEnumerable<Device>> GetDevices()
        {
            return _context.Devices.ToList();
        }

        // GET: api/Devices/5
        [HttpGet("{id}")]
        public ActionResult<Device> GetDevice(int id)
        {
            var device = _context.Devices.Find(id);

            if (device == null)
            {
                return NotFound();
            }

            return device;
        }

        // POST: api/Devices
        [HttpPost]
        public ActionResult<Device> PostDevice(Device device)
        {
            _context.Devices.Add(device);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetDevice), new { id = device.Id }, device);
        }

        // PUT: api/Devices/5
        [HttpPut("{id}")]
        public IActionResult PutDevice(int id, Device device)
        {
            if (id != device.Id)
            {
                return BadRequest();
            }

            _context.Entry(device).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
            _context.SaveChanges();

            return NoContent();
        }

        // DELETE: api/Devices/5
        [HttpDelete("{id}")]
        public IActionResult DeleteDevice(int id)
        {
            var device = _context.Devices.Find(id);
            if (device == null)
            {
                return NotFound();
            }

            _context.Devices.Remove(device);
            _context.SaveChanges();

            return NoContent();
        }
    }
}
