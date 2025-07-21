namespace StockControlSystem.API.Dtos
{
    public class ServiceDocumentDto
    {
        public int Id { get; set; }
        public int PRVServiceId { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string AttachmentType { get; set; }
        public DateTime UploadDate { get; set; }
    }
}