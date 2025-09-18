using HTTPMonitor.Models;
using HTTPMonitor.Services;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;
using System.Windows.Threading;

namespace HTTPMonitor.Controls
{
    public partial class StatisticsControl : UserControl
    {
        private readonly LoggingService _loggingService;
        private readonly StatisticsService _statisticsService;
        private readonly DispatcherTimer _refreshTimer;

        public StatisticsControl(LoggingService loggingService, StatisticsService statisticsService)
        {
            InitializeComponent();
            _loggingService = loggingService;
            _statisticsService = statisticsService;

            // Set up data grid
            LogsDataGrid.ItemsSource = _loggingService.Logs;

            // Set up refresh timer
            _refreshTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(1)
            };
            _refreshTimer.Tick += RefreshTimer_Tick;
            _refreshTimer.Start();
        }

        private void RefreshTimer_Tick(object? sender, EventArgs e) // Добавлен nullable для sender
        {

            var stats = _statisticsService?.Statistics;
            if (stats == null) return;

            UptimeTextBlock.Text = stats.Uptime.ToString(@"hh\:mm\:ss");
            StartTimeTextBlock.Text = $"Start Time: {stats.StartTime.ToShortTimeString()}";
            TotalRequestsTextBlock.Text = stats.TotalRequests.ToString();
            GetRequestsTextBlock.Text = stats.GetRequests.ToString();
            PostRequestsTextBlock.Text = $"POST Requests: {stats.PostRequests}";
            AvgProcessingTimeTextBlock.Text = $"Avg. Time: {stats.AverageProcessingTime}ms";


            DrawRequestChart();
        }


        private void DrawRequestChart()
        {
            ChartCanvas.Children.Clear();

            var stats = _statisticsService.Statistics;
            if (stats.RequestsPerMinute.Count == 0)
                return;

            double chartWidth = ChartCanvas.ActualWidth;
            double chartHeight = ChartCanvas.ActualHeight;

            if (chartWidth <= 0 || chartHeight <= 0)
                return;

            // Sort data by time
            var sortedData = stats.RequestsPerMinute.OrderBy(kv => kv.Key).ToList();

            // Find the max value for scaling
            int maxRequests = sortedData.Max(kv => kv.Value);
            if (maxRequests == 0) maxRequests = 1; // Avoid division by zero

            // Draw axes
            Line xAxis = new Line
            {
                X1 = 40,
                Y1 = chartHeight - 20,
                X2 = chartWidth,
                Y2 = chartHeight - 20,
                Stroke = Brushes.Black,
                StrokeThickness = 1
            };
            ChartCanvas.Children.Add(xAxis);

            Line yAxis = new Line
            {
                X1 = 40,
                Y1 = 0,
                X2 = 40,
                Y2 = chartHeight - 20,
                Stroke = Brushes.Black,
                StrokeThickness = 1
            };
            ChartCanvas.Children.Add(yAxis);

            // Draw y-axis labels
            for (int i = 0; i <= 5; i++)
            {
                double y = chartHeight - 20 - ((chartHeight - 30) / 5 * i);
                int value = maxRequests / 5 * i;

                Line tick = new Line
                {
                    X1 = 35,
                    Y1 = y,
                    X2 = 40,
                    Y2 = y,
                    Stroke = Brushes.Black,
                    StrokeThickness = 1
                };
                ChartCanvas.Children.Add(tick);

                TextBlock label = new TextBlock
                {
                    Text = value.ToString(),
                    FontSize = 10,
                    TextAlignment = TextAlignment.Right,
                    Width = 30
                };
                Canvas.SetLeft(label, 0);
                Canvas.SetTop(label, y - 7);
                ChartCanvas.Children.Add(label);
            }

            // Calculate bar width
            double barWidth = (chartWidth - 50) / Math.Max(1, sortedData.Count);
            barWidth = Math.Min(barWidth, 30); // Cap width

            // Draw bars
            for (int i = 0; i < sortedData.Count; i++)
            {
                var dataPoint = sortedData[i];
                double barHeight = (dataPoint.Value / (double)maxRequests) * (chartHeight - 30);

                Rectangle bar = new Rectangle
                {
                    Width = barWidth - 2,
                    Height = barHeight,
                    Fill = new SolidColorBrush(Colors.CornflowerBlue)
                };

                Canvas.SetLeft(bar, 40 + (i * barWidth));
                Canvas.SetTop(bar, chartHeight - 20 - barHeight);
                ChartCanvas.Children.Add(bar);

                // Add time label for every 10th bar, or if few bars
                if (i % 10 == 0 || sortedData.Count < 10)
                {
                    TextBlock timeLabel = new TextBlock
                    {
                        Text = dataPoint.Key.ToString("HH:mm"),
                        FontSize = 8,
                        Width = barWidth * 3,
                        TextAlignment = TextAlignment.Center
                    };

                    Canvas.SetLeft(timeLabel, 40 + (i * barWidth) - barWidth);
                    Canvas.SetTop(timeLabel, chartHeight - 18);
                    ChartCanvas.Children.Add(timeLabel);
                }
            }
        }

        private void ApplyFilters_Click(object sender, RoutedEventArgs e)
        {
            string methodFilter = (MethodFilterComboBox.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "All";
            string statusFilter = (StatusFilterComboBox.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "All";

            string? method = methodFilter == "All" ? null : methodFilter;
            HttpStatusCode? statusCode = null;

            if (statusFilter != "All")
            {
                string[] statusParts = statusFilter.Split(' ');
                if (int.TryParse(statusParts[0], out int statusValue))
                {
                    statusCode = (HttpStatusCode)statusValue;
                }
            }

            var filteredLogs = _loggingService?.FilterLogs(method, statusCode) ?? new ObservableCollection<RequestLog>();
            LogsDataGrid.ItemsSource = filteredLogs;
        }

        private void LogsDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (LogsDataGrid.SelectedItem is RequestLog selectedLog)
            {
                // Show details dialog
                var detailsWindow = new Window
                {
                    Title = $"Request Details: {selectedLog.Id}",
                    Width = 700,
                    Height = 500,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner
                };

                var scrollViewer = new ScrollViewer();
                var contentGrid = new Grid();

                contentGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
                contentGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
                contentGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
                contentGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
                contentGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
                contentGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
                contentGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

                AddDetailRow(contentGrid, 0, "Method & URL:", $"{selectedLog.Method} {selectedLog.Url}");
                AddDetailRow(contentGrid, 1, "Timestamp:", selectedLog.Timestamp.ToString());
                AddDetailRow(contentGrid, 2, "Status:", $"{(int)selectedLog.StatusCode} ({selectedLog.StatusCode})");
                AddDetailRow(contentGrid, 3, "Processing Time:", $"{selectedLog.ProcessingTimeMs}ms");
                AddDetailRow(contentGrid, 4, "Headers:", selectedLog.Headers);
                AddDetailRow(contentGrid, 5, "Request Body:", selectedLog.Body ?? "N/A");
                AddDetailRow(contentGrid, 6, "Response:", selectedLog.Response ?? "N/A");

                scrollViewer.Content = contentGrid;
                detailsWindow.Content = scrollViewer;
                detailsWindow.ShowDialog();
            }
        }

        private void AddDetailRow(Grid grid, int row, string label, string value)
        {
            var labelBlock = new TextBlock
            {
                Text = label,
                FontWeight = FontWeights.Bold,
                Margin = new Thickness(10, 10, 5, 0),
                VerticalAlignment = VerticalAlignment.Top
            };

            Grid.SetRow(labelBlock, row);
            Grid.SetColumn(labelBlock, 0);
            grid.Children.Add(labelBlock);

            var valueBlock = new TextBox
            {
                Text = value,
                IsReadOnly = true,
                TextWrapping = TextWrapping.Wrap,
                Margin = new Thickness(5, 10, 10, 10),
                VerticalAlignment = VerticalAlignment.Top,
                Height = value.Length > 100 ? 200 : Double.NaN,
                AcceptsReturn = true,
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto
            };

            Grid.SetRow(valueBlock, row);
            Grid.SetColumn(valueBlock, 1);
            grid.Children.Add(valueBlock);
        }
    }
}