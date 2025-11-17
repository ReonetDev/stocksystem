using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StockControlSystem.API.Models
{
    public class ServiceDocument
    {
        [Key]
        public int Id { get; set; }
        public int PRVServiceId { get; set; }
        [ForeignKey("PRVServiceId")]
        public PRVService? PRVService { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; } // URL to the blob storage
        public string? AttachmentType { get; set; }
        public DateTime UploadDate { get; set; }
    }
}