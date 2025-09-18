using System;
using System.Windows;
using System.Windows.Controls;
using HTTPMonitor.Services;

namespace HTTPMonitor.Controls
{
    public partial class ServerControl : UserControl
    {
        private readonly HttpServerService _serverService;

        public ServerControl(HttpServerService serverService)
        {
            InitializeComponent();
            _serverService = serverService;

            _serverService.ServerStatusChanged += OnServerStatusChanged;
        }

        private void OnServerStatusChanged(object? sender, string message)
        {
            if (message == null) throw new ArgumentNullException(nameof(message));

            Dispatcher.Invoke(() =>
            {
                LogsTextBox.AppendText($"[{DateTime.Now}] {message}\n");
                LogsTextBox.ScrollToEnd();

                ServerStatusTextBlock.Text = _serverService.IsRunning
                    ? $"Server: Running on port {_serverService.Port}"
                    : "Server: Stopped";

                ToggleServerButton.Content = _serverService.IsRunning ? "Stop Server" : "Start Server";
            });
        }

        private async void ToggleServerButton_Click(object sender, RoutedEventArgs e)
        {
            if (_serverService.IsRunning)
            {
                _serverService.Stop();
            }
            else
            {
                if (int.TryParse(PortTextBox.Text, out int port) && port > 0 && port < 65536)
                {
                    try
                    {
                        await _serverService.StartAsync(port);
                    }
                    catch (Exception ex)
                    {
                        LogsTextBox.AppendText($"[{DateTime.Now}] Error starting server: {ex.Message}\n");
                        LogsTextBox.ScrollToEnd();
                    }
                }
                else
                {
                    MessageBox.Show("Please enter a valid port number (1-65535).", "Invalid Port", MessageBoxButton.OK, MessageBoxImage.Warning);
                }
            }
        }
    }
}