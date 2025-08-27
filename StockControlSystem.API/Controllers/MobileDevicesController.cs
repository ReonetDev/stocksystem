using Microsoft.AspNetCore.Mvc;
using StockControlSystem.API.Models;
using StockControlSystem.API.Data;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace StockControlSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MobileDevicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MobileDevicesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/MobileDevices
        [HttpGet]
        public ActionResult<IEnumerable<MobileDevice>> GetMobileDevices()
        {
            return _context.MobileDevices.ToList();
        }

        // GET: api/MobileDevices/5
        [HttpGet("{id}")]
        public ActionResult<MobileDevice> GetMobileDevice(int id)
        {
            var mobileDevice = _context.MobileDevices.Find(id);

            if (mobileDevice == null)
            {
                return NotFound();
            }

            return mobileDevice;
        }

        // POST: api/MobileDevices
        [HttpPost]
        public ActionResult<MobileDevice> PostMobileDevice(MobileDevice mobileDevice)
        {
            _context.MobileDevices.Add(mobileDevice);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetMobileDevice), new { id = mobileDevice.Id }, mobileDevice);
        }

        // PUT: api/MobileDevices/5
        [HttpPut("{id}")]
        public IActionResult PutMobileDevice(int id, MobileDevice mobileDevice)
        {
            if (id != mobileDevice.Id)
            {
                return BadRequest();
            }

            _context.Entry(mobileDevice).State = EntityState.Modified;
            _context.SaveChanges();

            return NoContent();
        }

        // DELETE: api/MobileDevices/5
        [HttpDelete("{id}")]
        public IActionResult DeleteMobileDevice(int id)
        {
            var mobileDevice = _context.MobileDevices.Find(id);
            if (mobileDevice == null)
            {
                return NotFound();
            }

            _context.MobileDevices.Remove(mobileDevice);
            _context.SaveChanges();

            return NoContent();
        }
    }
}
