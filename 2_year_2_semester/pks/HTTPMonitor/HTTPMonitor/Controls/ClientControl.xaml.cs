using System;
using System.Windows;
using System.Windows.Controls;
using HTTPMonitor.Services;

namespace HTTPMonitor.Controls
{
    public partial class ClientControl : UserControl
    {
        private readonly HttpClientService _clientService;

        public ClientControl(HttpClientService clientService)
        {
            _clientService = clientService ?? throw new ArgumentNullException(nameof(clientService));
            InitializeComponent();
        }

        private void MethodComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (MethodComboBox == null || RequestBodyTextBox == null) return;

            if (MethodComboBox.SelectedItem is ComboBoxItem selectedItem && selectedItem.Content != null)
            {
                string selectedMethod = selectedItem.Content.ToString() ?? "GET";
                RequestBodyTextBox.IsEnabled = selectedMethod != "GET";
            }
        }
        private async void SendRequestButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string url = UrlTextBox.Text ?? string.Empty;
                string method = "GET"; // Значение по умолчанию

                if (MethodComboBox.SelectedItem is ComboBoxItem selectedItem && selectedItem.Content != null)
                {
                    method = selectedItem.Content.ToString() ?? "GET";
                }

                string? body = method != "GET" ? RequestBodyTextBox.Text : null;

                SendRequestButton.IsEnabled = false;
                ResponseTextBox.Text = "Sending request...";

                string response = await _clientService.SendRequestAsync(url, method, body);

                ResponseTextBox.Text = response;
            }
            catch (Exception ex)
            {
                ResponseTextBox.Text = $"Error: {ex.Message}";
            }
            finally
            {
                SendRequestButton.IsEnabled = true;
            }
        }

        private void GetJsonPlaceholderPosts_Click(object sender, RoutedEventArgs e)
        {
            UrlTextBox.Text = "https://jsonplaceholder.typicode.com/posts";
            MethodComboBox.SelectedIndex = 0; // GET
            RequestBodyTextBox.Text = string.Empty;
        }

        private void PostToLocalServer_Click(object sender, RoutedEventArgs e)
        {
            UrlTextBox.Text = "http://localhost:8080";
            MethodComboBox.SelectedIndex = 1; // POST
            RequestBodyTextBox.Text = "{\n  \"Message\": \"This is a test message from the client\"\n}";
        }

        private void GetServerStatus_Click(object sender, RoutedEventArgs e)
        {
            UrlTextBox.Text = "http://localhost:8080";
            MethodComboBox.SelectedIndex = 0; // GET
            RequestBodyTextBox.Text = string.Empty;
        }
    }
}