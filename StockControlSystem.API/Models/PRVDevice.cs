using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StockControlSystem.API.Models{

    public class PRVDevice {
        [Key]
        public int Id { get; set; }
        public string SupplyDescription { get; set; }
        public string Technician { get; set; }
        public string PRV_Status { get; set; }
        public int? PRV_Size { get; set; }
        public string? PRV_Make { get; set; }
        public double? Upstream_pressure { get; set; }
        public double? Downstream_pressure { get; set; }
        public bool? Time_Modulated_Controller { get; set; }
        public double? Downstream_pressure_offpeak { get; set; }
        public bool? Pilot_Present { get; set; }
        public string? Pilot_Control_Mechanism { get; set; }
        public string? Pilot_make_peak { get; set; }
        public string? Pilot_make_offpeak { get; set; }
        public string? Advanced_Controller_Manufacturer { get; set; }
        public bool? Solenoid_Open { get; set; }
        public bool? Ball_valves_present { get; set; }
        public bool? Strainer_present { get; set; }
        public bool? Needle_valve_present { get; set; }
        public bool? Restrictor_Present { get; set; }
        public bool? Ball_valve_on_bonnet_present { get; set; }
        public string? Needle_valve_turns { get; set; }
        public bool? Needle_valve_scoured { get; set; }
        public bool? Pilot_system_flush_bleed { get; set; }
        public bool? Air_Valve_present { get; set; }
        public bool? Strainer_clean { get; set; }
        public bool? Main_valve_respond_to_pilot_adjustment { get; set; }
        public bool? Leaking_fittings { get; set; }
        public bool? Chamber_Cover_present { get; set; }
        public bool? Lock_present { get; set; }
        public bool? Lock_working { get; set; }
        public bool? Sufficient_working_Room { get; set; }
        public string? Chamber_Material { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public int? Meter_Size { get; set; }
        public string? Meter_Type { get; set; }
        public string? Meter_Manufacturer { get; set; }
        public string? Meter_Serial_no { get; set; }
        public bool? Strainer_Dirt_Box { get; set; }
        public bool? Meter_Functional { get; set; }
        
        [ForeignKey("SiteId")]
        public Site Site { get; set; }
    }
}