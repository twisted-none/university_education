using System;

namespace HTTPMonitor.Models
{
    public class MessageData
    {
        public Guid Id { get; set; }
        public string Message { get; set; } = string.Empty; // Инициализация
        public DateTime CreatedAt { get; set; }

        public MessageData()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.Now;
        }
    }
}