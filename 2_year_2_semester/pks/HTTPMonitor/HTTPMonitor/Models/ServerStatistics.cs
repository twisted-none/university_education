using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace HTTPMonitor.Models
{
    public class ServerStatistics : INotifyPropertyChanged
    {
        private int _totalRequests;
        private int _getRequests;
        private int _postRequests;
        private long _averageProcessingTime;
        private DateTime _startTime;
        private Dictionary<DateTime, int> _requestsPerMinute = new Dictionary<DateTime, int>();
        private string _requestPathMinute = string.Empty;

        public int TotalRequests
        {
            get => _totalRequests;
            set
            {
                _totalRequests = value;
                OnPropertyChanged();
            }
        }

        public int GetRequests
        {
            get => _getRequests;
            set
            {
                _getRequests = value;
                OnPropertyChanged();
            }
        }

        public int PostRequests
        {
            get => _postRequests;
            set
            {
                _postRequests = value;
                OnPropertyChanged();
            }
        }

        public long AverageProcessingTime
        {
            get => _averageProcessingTime;
            set
            {
                _averageProcessingTime = value;
                OnPropertyChanged();
            }
        }

        public DateTime StartTime
        {
            get => _startTime;
            set
            {
                _startTime = value;
                OnPropertyChanged();
            }
        }

        public TimeSpan Uptime => DateTime.Now - StartTime;

        public Dictionary<DateTime, int> RequestsPerMinute
        {
            get => _requestsPerMinute;
            set
            {
                _requestsPerMinute = value;
                OnPropertyChanged();
            }
        }

        public ServerStatistics()
        {
            StartTime = DateTime.Now;
            RequestsPerMinute = new Dictionary<DateTime, int>();
            _requestPathMinute = string.Empty;
        }

        public event PropertyChangedEventHandler? PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

    }
}