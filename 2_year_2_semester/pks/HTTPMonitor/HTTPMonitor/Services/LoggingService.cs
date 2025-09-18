using HTTPMonitor.Models;
using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace HTTPMonitor.Services
{
    public class LoggingService
    {
        private readonly string _logFilePath;
        public ObservableCollection<RequestLog> Logs { get; }

        public LoggingService(string logFilePath = "logs.txt")
        {
            _logFilePath = logFilePath;
            Logs = new ObservableCollection<RequestLog>();
        }

        public async Task LogRequestAsync(RequestLog log)
        {
            App.Current.Dispatcher.Invoke(() =>
            {
                log.Id = Logs.Count + 1;
                Logs.Add(log);
            });

            await WriteToFileAsync(log);
        }

        private async Task WriteToFileAsync(RequestLog log)
        {
            var logEntry = new StringBuilder();
            logEntry.AppendLine("==========================================================");
            logEntry.AppendLine($"ID: {log.Id}");
            logEntry.AppendLine($"Timestamp: {log.Timestamp}");
            logEntry.AppendLine($"Type: {log.Type}");
            logEntry.AppendLine($"Method: {log.Method}");
            logEntry.AppendLine($"URL: {log.Url}");
            logEntry.AppendLine("Headers:");
            logEntry.AppendLine(log.Headers);

            if (!string.IsNullOrEmpty(log.Body))
            {
                logEntry.AppendLine("Body:");
                logEntry.AppendLine(log.Body);
            }

            logEntry.AppendLine($"Status Code: {(int)log.StatusCode} ({log.StatusCode})");
            logEntry.AppendLine($"Processing Time: {log.ProcessingTimeMs}ms");

            if (!string.IsNullOrEmpty(log.Response))
            {
                logEntry.AppendLine("Response:");
                logEntry.AppendLine(log.Response);
            }

            logEntry.AppendLine("==========================================================");
            logEntry.AppendLine();

            try
            {
                await File.AppendAllTextAsync(_logFilePath, logEntry.ToString());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to write to log file: {ex.Message}");
            }
        }

        public ObservableCollection<RequestLog> FilterLogs(string? method = null, HttpStatusCode? statusCode = null)
        {
            var filteredLogs = new ObservableCollection<RequestLog>();

            if (Logs == null) return filteredLogs;

            foreach (var log in Logs)
            {
                if (log == null) continue;

                bool methodMatch = string.IsNullOrEmpty(method) ||
                                 (log.Method != null && log.Method.Equals(method, StringComparison.OrdinalIgnoreCase));
                bool statusMatch = !statusCode.HasValue || log.StatusCode == statusCode.Value;

                if (methodMatch && statusMatch)
                {
                    filteredLogs.Add(log);
                }
            }

            return filteredLogs;
        }
    }
}