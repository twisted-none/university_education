using System;
using System.Net;

namespace HTTPMonitor.Models
{
    public class RequestLog
    {
        public int Id { get; set; }
        public DateTime Timestamp { get; set; }
        public string Method { get; set; } = string.Empty; 
        public string Url { get; set; } = string.Empty;  
        public string Headers { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;  
        public HttpStatusCode StatusCode { get; set; }
        public string Response { get; set; } = string.Empty;
        public long ProcessingTimeMs { get; set; }
        public RequestType Type { get; set; }

        public RequestLog()
        {
            Timestamp = DateTime.Now;
        }

        public override string ToString()
        {
            return $"[{Timestamp}] {Method} {Url} - {(int)StatusCode} ({ProcessingTimeMs}ms)";
        }
    }

    public enum RequestType
    {
        Incoming,
        Outgoing
    }
}