using Microsoft.AspNetCore.Http;
using System;

namespace StockControlSystem.API.Dtos
{
    public class PRVServiceUpdateDto
    {
        public int Id { get; set; }
        public int PRVDeviceId { get; set; }
        public DateTime? LastServiceDate { get; set; }
        public DateTime? NextServiceDate { get; set; }
        public int? ServiceInterval { get; set; }
        public string? ServiceType { get; set; }
        public IFormFile? File { get; set; }
        public string? AttachmentType { get; set; }
    }
}