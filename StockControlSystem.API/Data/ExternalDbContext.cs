using Microsoft.EntityFrameworkCore;
using StockControlSystem.API.Models.External;

namespace StockControlSystem.API.Data
{
    public class ExternalDbContext : DbContext
    {
        public ExternalDbContext(DbContextOptions<ExternalDbContext> options) : base(options)
        {
        }

        public DbSet<ReoMeter> ReoMeters { get; set; }
        public DbSet<ReoDataLog> ReoDataLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ReoMeter>().ToTable("ReoMeter");
            modelBuilder.Entity<ReoDataLog>().ToTable("ReoDataLog");
        }
    }
}
