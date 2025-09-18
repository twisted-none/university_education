using System;
using System.Collections.Generic;
using System.Linq;
using HTTPMonitor.Models;

namespace HTTPMonitor.Services
{
    public class StatisticsService
    {
        private readonly ServerStatistics _statistics;
        private long _totalProcessingTime;

        public StatisticsService()
        {
            _statistics = new ServerStatistics();
            _totalProcessingTime = 0;
        }

        public ServerStatistics Statistics => _statistics;

        public void RecordRequest(RequestLog log)
        {
            if (log.Type != RequestType.Incoming) return;

            _statistics.TotalRequests++;

            if (log.Method == "GET")
                _statistics.GetRequests++;
            else if (log.Method == "POST")
                _statistics.PostRequests++;

            _totalProcessingTime += log.ProcessingTimeMs;
            _statistics.AverageProcessingTime = _totalProcessingTime / _statistics.TotalRequests;

            // Record for time-based analytics
            var minute = new DateTime(log.Timestamp.Year, log.Timestamp.Month, log.Timestamp.Day,
                                    log.Timestamp.Hour, log.Timestamp.Minute, 0);

            if (_statistics.RequestsPerMinute.ContainsKey(minute))
                _statistics.RequestsPerMinute[minute]++;
            else
                _statistics.RequestsPerMinute[minute] = 1;

            // Keep only last 60 minutes of data
            CleanupOldData();
        }

        private void CleanupOldData()
        {
            var threshold = DateTime.Now.AddHours(-1);
            var keysToRemove = _statistics.RequestsPerMinute.Keys.Where(k => k < threshold).ToList();

            foreach (var key in keysToRemove)
            {
                _statistics.RequestsPerMinute.Remove(key);
            }

            // Notify of changes
            _statistics.RequestsPerMinute = new Dictionary<DateTime, int>(_statistics.RequestsPerMinute);
        }
    }
}