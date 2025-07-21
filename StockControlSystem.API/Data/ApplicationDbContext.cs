using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Models;
using StockControlSystem.Models;

namespace StockControlSystem.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<SerialStock> SerialStock { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<DeliveryNote> DeliveryNotes { get; set; }
        public DbSet<DeliveryNoteItem> DeliveryNoteItems { get; set; }
        public DbSet<Consumable> Consumables { get; set; }
        public DbSet<SimCard> SimCards { get; set; }
        public DbSet<PRVDevice> PRVDevices { get; set; }
        public DbSet<PRVService> PRVServices { get; set; }
        public DbSet<ServiceDocument> ServiceDocuments { get; set; }
        public DbSet<Technician> Technicians { get; set; }
        public DbSet<Site> Sites { get; set; }
        public DbSet<Region> Regions { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<BusinessUnit> BusinessUnits { get; set; }
        public DbSet<Module> Modules { get; set; }
    }
}