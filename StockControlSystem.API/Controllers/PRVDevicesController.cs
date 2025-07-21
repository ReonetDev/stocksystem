using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Data;
using StockControlSystem.API.Models;
using StockControlSystem.API.Dtos;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace StockControlSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PRVDevicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PRVDevicesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/PRVDevices
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PRVDeviceDto>>> GetPRVDevices()
        {
            var prvDevices = await _context.PRVDevices
                .Include(p => p.Site)
                    .ThenInclude(s => s.Client)
                        .ThenInclude(c => c.BusinessUnit)
                .Include(p => p.Site)
                    .ThenInclude(s => s.Region)
                .Select(p => new PRVDeviceDto
                {
                    Id = p.Id,
                    SupplyDescription = p.SupplyDescription,
                    Technician = p.Technician,
                    PRV_Status = p.PRV_Status,
                    PRV_Size = p.PRV_Size,
                    PRV_Make = p.PRV_Make,
                    Upstream_pressure = p.Upstream_pressure,
                    Downstream_pressure = p.Downstream_pressure,
                    Time_Modulated_Controller = p.Time_Modulated_Controller,
                    Downstream_pressure_offpeak = p.Downstream_pressure_offpeak,
                    Pilot_Present = p.Pilot_Present,
                    Pilot_Control_Mechanism = p.Pilot_Control_Mechanism,
                    Pilot_make_peak = p.Pilot_make_peak,
                    Pilot_make_offpeak = p.Pilot_make_offpeak,
                    Advanced_Controller_Manufacturer = p.Advanced_Controller_Manufacturer,
                    Solenoid_Open = p.Solenoid_Open,
                    Ball_valves_present = p.Ball_valves_present,
                    Strainer_present = p.Strainer_present,
                    Needle_valve_present = p.Needle_valve_present,
                    Restrictor_Present = p.Restrictor_Present,
                    Ball_valve_on_bonnet_present = p.Ball_valve_on_bonnet_present,
                    Needle_valve_turns = p.Needle_valve_turns,
                    Needle_valve_scoured = p.Needle_valve_scoured,
                    Pilot_system_flush_bleed = p.Pilot_system_flush_bleed,
                    Air_Valve_present = p.Air_Valve_present,
                    Strainer_clean = p.Strainer_clean,
                    Main_valve_respond_to_pilot_adjustment = p.Main_valve_respond_to_pilot_adjustment,
                    Leaking_fittings = p.Leaking_fittings,
                    Chamber_Cover_present = p.Chamber_Cover_present,
                    Lock_present = p.Lock_present,
                    Lock_working = p.Lock_working,
                    Sufficient_working_Room = p.Sufficient_working_Room,
                    Chamber_Material = p.Chamber_Material,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    Meter_Size = p.Meter_Size,
                    Meter_Type = p.Meter_Type,
                    Meter_Manufacturer = p.Meter_Manufacturer,
                    Meter_Serial_no = p.Meter_Serial_no,
                    Strainer_Dirt_Box = p.Strainer_Dirt_Box,
                    Meter_Functional = p.Meter_Functional,
                    SiteId = p.Site.Id,
                    SiteName = p.Site.Name,
                    RegionName = p.Site.Region.Name,
                    ClientName = p.Site.Client.Name,
                    BusinessUnitName = p.Site.Client.BusinessUnit.Name
                })
                .ToListAsync();

            return Ok(prvDevices);
        }

        // GET: api/PRVDevices/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PRVDeviceDto>> GetPRVDevice(int id)
        {
            var prvDevice = await _context.PRVDevices
                .Include(p => p.Site)
                .Select(p => new PRVDeviceDto
                {
                    Id = p.Id,
                    SupplyDescription = p.SupplyDescription,
                    Technician = p.Technician,
                    PRV_Status = p.PRV_Status,
                    PRV_Size = p.PRV_Size,
                    PRV_Make = p.PRV_Make,
                    Upstream_pressure = p.Upstream_pressure,
                    Downstream_pressure = p.Downstream_pressure,
                    Time_Modulated_Controller = p.Time_Modulated_Controller,
                    Downstream_pressure_offpeak = p.Downstream_pressure_offpeak,
                    Pilot_Present = p.Pilot_Present,
                    Pilot_Control_Mechanism = p.Pilot_Control_Mechanism,
                    Pilot_make_peak = p.Pilot_make_peak,
                    Pilot_make_offpeak = p.Pilot_make_offpeak,
                    Advanced_Controller_Manufacturer = p.Advanced_Controller_Manufacturer,
                    Solenoid_Open = p.Solenoid_Open,
                    Ball_valves_present = p.Ball_valves_present,
                    Strainer_present = p.Strainer_present,
                    Needle_valve_present = p.Needle_valve_present,
                    Restrictor_Present = p.Restrictor_Present,
                    Ball_valve_on_bonnet_present = p.Ball_valve_on_bonnet_present,
                    Needle_valve_turns = p.Needle_valve_turns,
                    Needle_valve_scoured = p.Needle_valve_scoured,
                    Pilot_system_flush_bleed = p.Pilot_system_flush_bleed,
                    Air_Valve_present = p.Air_Valve_present,
                    Strainer_clean = p.Strainer_clean,
                    Main_valve_respond_to_pilot_adjustment = p.Main_valve_respond_to_pilot_adjustment,
                    Leaking_fittings = p.Leaking_fittings,
                    Chamber_Cover_present = p.Chamber_Cover_present,
                    Lock_present = p.Lock_present,
                    Lock_working = p.Lock_working,
                    Sufficient_working_Room = p.Sufficient_working_Room,
                    Chamber_Material = p.Chamber_Material,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    Meter_Size = p.Meter_Size,
                    Meter_Type = p.Meter_Type,
                    Meter_Manufacturer = p.Meter_Manufacturer,
                    Meter_Serial_no = p.Meter_Serial_no,
                    Strainer_Dirt_Box = p.Strainer_Dirt_Box,
                    Meter_Functional = p.Meter_Functional,
                    SiteId = p.Site.Id,
                    SiteName = p.Site.Name,
                    RegionName = p.Site.Region.Name,
                    ClientName = p.Site.Client.Name,
                    BusinessUnitName = p.Site.Client.BusinessUnit.Name
                })
                .FirstOrDefaultAsync(p => p.Id == id);

            if (prvDevice == null)
            {
                return NotFound();
            }

            return Ok(prvDevice);
        }

        // POST: api/PRVDevices
        [HttpPost]
        [Authorize(Roles = "Admin,SysAdmin")]
        public async Task<ActionResult<PRVDevice>> PostPRVDevice(PRVDeviceDto prvDeviceDto)
        {
            var prvDevice = new PRVDevice
            {
                SupplyDescription = prvDeviceDto.SupplyDescription,
                Technician = prvDeviceDto.Technician,
                PRV_Status = prvDeviceDto.PRV_Status,
                PRV_Size = prvDeviceDto.PRV_Size,
                PRV_Make = prvDeviceDto.PRV_Make,
                Upstream_pressure = prvDeviceDto.Upstream_pressure,
                Downstream_pressure = prvDeviceDto.Downstream_pressure,
                Time_Modulated_Controller = prvDeviceDto.Time_Modulated_Controller,
                Downstream_pressure_offpeak = prvDeviceDto.Downstream_pressure_offpeak,
                Pilot_Present = prvDeviceDto.Pilot_Present,
                Pilot_Control_Mechanism = prvDeviceDto.Pilot_Control_Mechanism,
                Pilot_make_peak = prvDeviceDto.Pilot_make_peak,
                Pilot_make_offpeak = prvDeviceDto.Pilot_make_offpeak,
                Advanced_Controller_Manufacturer = prvDeviceDto.Advanced_Controller_Manufacturer,
                Solenoid_Open = prvDeviceDto.Solenoid_Open,
                Ball_valves_present = prvDeviceDto.Ball_valves_present,
                Strainer_present = prvDeviceDto.Strainer_present,
                Needle_valve_present = prvDeviceDto.Needle_valve_present,
                Restrictor_Present = prvDeviceDto.Restrictor_Present,
                Ball_valve_on_bonnet_present = prvDeviceDto.Ball_valve_on_bonnet_present,
                Needle_valve_turns = prvDeviceDto.Needle_valve_turns,
                Needle_valve_scoured = prvDeviceDto.Needle_valve_scoured,
                Pilot_system_flush_bleed = prvDeviceDto.Pilot_system_flush_bleed,
                Air_Valve_present = prvDeviceDto.Air_Valve_present,
                Strainer_clean = prvDeviceDto.Strainer_clean,
                Main_valve_respond_to_pilot_adjustment = prvDeviceDto.Main_valve_respond_to_pilot_adjustment,
                Leaking_fittings = prvDeviceDto.Leaking_fittings,
                Chamber_Cover_present = prvDeviceDto.Chamber_Cover_present,
                Lock_present = prvDeviceDto.Lock_present,
                Lock_working = prvDeviceDto.Lock_working,
                Sufficient_working_Room = prvDeviceDto.Sufficient_working_Room,
                Chamber_Material = prvDeviceDto.Chamber_Material,
                Latitude = prvDeviceDto.Latitude,
                Longitude = prvDeviceDto.Longitude,
                Meter_Size = prvDeviceDto.Meter_Size,
                Meter_Type = prvDeviceDto.Meter_Type,
                Meter_Manufacturer = prvDeviceDto.Meter_Manufacturer,
                Meter_Serial_no = prvDeviceDto.Meter_Serial_no,
                Strainer_Dirt_Box = prvDeviceDto.Strainer_Dirt_Box,
                Meter_Functional = prvDeviceDto.Meter_Functional,
            };

            _context.Entry(prvDevice).Property("SiteId").CurrentValue = prvDeviceDto.SiteId;

            _context.PRVDevices.Add(prvDevice);
            await _context.SaveChangesAsync();

            // Reload the site with its Client and Region to return the full object
            await _context.Entry(prvDevice).Reference(p => p.Site).LoadAsync();

            return CreatedAtAction(nameof(GetPRVDevice), new { id = prvDevice.Id }, prvDevice);
        }

        // PUT: api/PRVDevices/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,SysAdmin")]
        public async Task<IActionResult> PutPRVDevice(int id, PRVDeviceDto prvDeviceDto)
        {
            
            if (id != prvDeviceDto.Id)
            {
                return BadRequest();
            }

            var prvDevice = await _context.PRVDevices.FindAsync(id);
            if (prvDevice == null)
            {
                return NotFound();
            }

            prvDevice.SupplyDescription = prvDeviceDto.SupplyDescription;
            prvDevice.Technician = prvDeviceDto.Technician;
            prvDevice.PRV_Status = prvDeviceDto.PRV_Status;
            prvDevice.PRV_Size = prvDeviceDto.PRV_Size;
            prvDevice.PRV_Make = prvDeviceDto.PRV_Make;
            prvDevice.Upstream_pressure = prvDeviceDto.Upstream_pressure;
            prvDevice.Downstream_pressure = prvDeviceDto.Downstream_pressure;
            prvDevice.Time_Modulated_Controller = prvDeviceDto.Time_Modulated_Controller;
            prvDevice.Downstream_pressure_offpeak = prvDeviceDto.Downstream_pressure_offpeak;
            prvDevice.Pilot_Present = prvDeviceDto.Pilot_Present;
            prvDevice.Pilot_Control_Mechanism = prvDeviceDto.Pilot_Control_Mechanism;
            prvDevice.Pilot_make_peak = prvDeviceDto.Pilot_make_peak;
            prvDevice.Pilot_make_offpeak = prvDeviceDto.Pilot_make_offpeak;
            prvDevice.Advanced_Controller_Manufacturer = prvDeviceDto.Advanced_Controller_Manufacturer;
            prvDevice.Solenoid_Open = prvDeviceDto.Solenoid_Open;
            prvDevice.Ball_valves_present = prvDeviceDto.Ball_valves_present;
            prvDevice.Strainer_present = prvDeviceDto.Strainer_present;
            prvDevice.Needle_valve_present = prvDeviceDto.Needle_valve_present;
            prvDevice.Restrictor_Present = prvDeviceDto.Restrictor_Present;
            prvDevice.Ball_valve_on_bonnet_present = prvDeviceDto.Ball_valve_on_bonnet_present;
            prvDevice.Needle_valve_turns = prvDeviceDto.Needle_valve_turns;
            prvDevice.Needle_valve_scoured = prvDeviceDto.Needle_valve_scoured;
            prvDevice.Pilot_system_flush_bleed = prvDeviceDto.Pilot_system_flush_bleed;
            prvDevice.Air_Valve_present = prvDeviceDto.Air_Valve_present;
            prvDevice.Strainer_clean = prvDeviceDto.Strainer_clean;
            prvDevice.Main_valve_respond_to_pilot_adjustment = prvDeviceDto.Main_valve_respond_to_pilot_adjustment;
            prvDevice.Leaking_fittings = prvDeviceDto.Leaking_fittings;
            prvDevice.Chamber_Cover_present = prvDeviceDto.Chamber_Cover_present;
            prvDevice.Lock_present = prvDeviceDto.Lock_present;
            prvDevice.Lock_working = prvDeviceDto.Lock_working;
            prvDevice.Sufficient_working_Room = prvDeviceDto.Sufficient_working_Room;
            prvDevice.Chamber_Material = prvDeviceDto.Chamber_Material;
            prvDevice.Latitude = prvDeviceDto.Latitude;
            prvDevice.Longitude = prvDeviceDto.Longitude;
            prvDevice.Meter_Size = prvDeviceDto.Meter_Size;
            prvDevice.Meter_Type = prvDeviceDto.Meter_Type;
            prvDevice.Meter_Manufacturer = prvDeviceDto.Meter_Manufacturer;
            prvDevice.Meter_Serial_no = prvDeviceDto.Meter_Serial_no;
            prvDevice.Strainer_Dirt_Box = prvDeviceDto.Strainer_Dirt_Box;
            prvDevice.Meter_Functional = prvDeviceDto.Meter_Functional;

            _context.Entry(prvDevice).Property("SiteId").CurrentValue = prvDeviceDto.SiteId;

            _context.Entry(prvDevice).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PRVDeviceExists(id))
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

        // DELETE: api/PRVDevices/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "SysAdmin")]
        public async Task<IActionResult> DeletePRVDevice(int id)
        {
            var prvDevice = await _context.PRVDevices.FindAsync(id);
            if (prvDevice == null)
            {
                return NotFound();
            }

            _context.PRVDevices.Remove(prvDevice);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PRVDeviceExists(int id)
        {
            return _context.PRVDevices.Any(e => e.Id == id);
        }
    }
}