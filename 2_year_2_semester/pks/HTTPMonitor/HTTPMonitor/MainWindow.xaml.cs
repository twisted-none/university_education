using System.Windows;
using HTTPMonitor.Controls;
using HTTPMonitor.Services;

namespace HTTPMonitor
{
    public partial class MainWindow : Window
    {
        private readonly LoggingService _loggingService;
        private readonly StatisticsService _statisticsService;
        private readonly HttpServerService _serverService;
        private readonly HttpClientService _clientService;

        public MainWindow()
        {
            try
            {
                InitializeComponent();

                // Initialize services
                _loggingService = new LoggingService();
                _statisticsService = new StatisticsService();
                _serverService = new HttpServerService(_loggingService, _statisticsService);
                _clientService = new HttpClientService(_loggingService);

                // Initialize controls
                ServerContentControl.Content = new ServerControl(_serverService);
                ClientContentControl.Content = new ClientControl(_clientService);
                StatisticsContentControl.Content = new StatisticsControl(_loggingService, _statisticsService);

                // Close the server when the window is closed
                Closing += (s, e) => _serverService.Stop();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при запуске приложения: {ex.Message}\n\nStackTrace: {ex.StackTrace}",
                                "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}