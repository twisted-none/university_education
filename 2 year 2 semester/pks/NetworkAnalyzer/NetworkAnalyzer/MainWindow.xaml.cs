// Обновленный файл MainWindow.xaml.cs с интеграцией JSON-хранилища
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace NetworkAnalyzer
{
    public partial class MainWindow : Window
    {
        private ObservableCollection<NetworkInterfaceInfo> _networkInterfaces;
        private ObservableCollection<UrlHistoryItem> _urlHistory;
        private JsonHistoryService _historyService;

        public MainWindow()
        {
            InitializeComponent();

            _networkInterfaces = new ObservableCollection<NetworkInterfaceInfo>();
            _urlHistory = new ObservableCollection<UrlHistoryItem>();
            _historyService = new JsonHistoryService();

            NetworkInterfacesList.ItemsSource = _networkInterfaces;
            UrlHistoryList.ItemsSource = _urlHistory;

            LoadNetworkInterfaces();
            LoadUrlHistoryFromFile();
        }

        private async void LoadUrlHistoryFromFile()
        {
            try
            {
                var history = await _historyService.LoadUrlHistoryAsync();
                _urlHistory.Clear();

                foreach (var item in history)
                {
                    _urlHistory.Add(item);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при загрузке истории URL: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void LoadNetworkInterfaces()
        {
            try
            {
                _networkInterfaces.Clear();
                NetworkInterface[] interfaces = NetworkInterface.GetAllNetworkInterfaces();

                foreach (NetworkInterface adapter in interfaces)
                {
                    _networkInterfaces.Add(new NetworkInterfaceInfo
                    {
                        Name = adapter.Name,
                        Description = adapter.Description,
                        NetworkInterface = adapter
                    });
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при загрузке сетевых интерфейсов: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void RefreshInterfaces_Click(object sender, RoutedEventArgs e)
        {
            LoadNetworkInterfaces();
        }

        private void NetworkInterfacesList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (NetworkInterfacesList.SelectedItem is NetworkInterfaceInfo selectedInterface)
            {
                DisplayNetworkInterfaceDetails(selectedInterface.NetworkInterface);
            }
        }

        private void DisplayNetworkInterfaceDetails(NetworkInterface networkInterface)
        {
            try
            {
                txtInterfaceName.Text = networkInterface.Name;
                txtInterfaceDescription.Text = networkInterface.Description;
                txtStatus.Text = networkInterface.OperationalStatus.ToString();
                txtSpeed.Text = FormatSpeed(networkInterface.Speed);
                txtMacAddress.Text = FormatMacAddress(networkInterface.GetPhysicalAddress().GetAddressBytes());

                IPInterfaceProperties ipProps = networkInterface.GetIPProperties();
                StringBuilder ipAddressesBuilder = new StringBuilder();
                StringBuilder subnetMasksBuilder = new StringBuilder();

                foreach (UnicastIPAddressInformation ip in ipProps.UnicastAddresses)
                {
                    if (ip.Address.AddressFamily == AddressFamily.InterNetwork)
                    {
                        ipAddressesBuilder.AppendLine(ip.Address.ToString());
                        subnetMasksBuilder.AppendLine(ip.IPv4Mask.ToString());
                    }
                    else if (ip.Address.AddressFamily == AddressFamily.InterNetworkV6)
                    {
                        ipAddressesBuilder.AppendLine($"{ip.Address} (IPv6)");
                        // IPv6 не использует маски подсети в том же формате
                        subnetMasksBuilder.AppendLine($"Префикс: {ip.PrefixLength}");
                    }
                }

                txtIpAddress.Text = ipAddressesBuilder.ToString();
                txtSubnetMask.Text = subnetMasksBuilder.ToString();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при отображении информации об интерфейсе: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private string FormatMacAddress(byte[] macBytes)
        {
            return string.Join("-", macBytes.Select(b => b.ToString("X2")));
        }

        private string FormatSpeed(long speedBps)
        {
            if (speedBps < 0)
                return "Неизвестно";

            double speedMbps = speedBps / 1_000_000.0;
            return $"{speedMbps:N2} Mbps";
        }

        private async void AnalyzeUrl_Click(object sender, RoutedEventArgs e)
        {
            string url = txtUrlInput.Text.Trim();
            if (string.IsNullOrEmpty(url))
            {
                MessageBox.Show("Введите URL для анализа", "Предупреждение", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                // Если URL не содержит схему, добавляем http://
                if (!url.Contains("://"))
                    url = "http://" + url;

                Uri uri = new Uri(url);

                // Анализ URL
                txtScheme.Text = uri.Scheme;
                txtHost.Text = uri.Host;
                txtPort.Text = uri.Port.ToString();
                txtPath.Text = uri.AbsolutePath;
                txtQuery.Text = uri.Query;
                txtFragment.Text = uri.Fragment;

                // Определение типа адреса
                IPAddress[] addresses = await Dns.GetHostAddressesAsync(uri.Host);
                if (addresses.Length > 0)
                {
                    IPAddress address = addresses[0];
                    string addressType = GetAddressType(address);
                    txtAddrType.Text = $"Тип адреса: {addressType}";
                }
                else
                {
                    txtAddrType.Text = "Тип адреса: Не определен";
                }

                // Добавление в историю
                AddToHistory(url);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при анализе URL: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private string GetAddressType(IPAddress address)
        {
            if (IPAddress.IsLoopback(address))
                return "Loopback";
            else if (address.AddressFamily == AddressFamily.InterNetwork)
            {
                byte[] bytes = address.GetAddressBytes();

                // Проверка на локальные адреса (RFC 1918)
                if (bytes[0] == 10) // 10.0.0.0/8
                    return "Локальный (Класс A)";
                else if (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) // 172.16.0.0/12
                    return "Локальный (Класс B)";
                else if (bytes[0] == 192 && bytes[1] == 168) // 192.168.0.0/16
                    return "Локальный (Класс C)";
                else
                    return "Публичный IPv4";
            }
            else if (address.AddressFamily == AddressFamily.InterNetworkV6)
            {
                return "IPv6";
            }

            return "Неизвестный";
        }

        private async void PingHost_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrEmpty(txtHost.Text))
            {
                MessageBox.Show("Сначала проанализируйте URL", "Информация", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            try
            {
                txtResults.Text = "Выполняется ping...";

                Ping ping = new Ping();
                PingReply reply = await ping.SendPingAsync(txtHost.Text, 3000);

                StringBuilder result = new StringBuilder();
                result.AppendLine($"Ping к {txtHost.Text}:");
                result.AppendLine($"Статус: {reply.Status}");

                if (reply.Status == IPStatus.Success)
                {
                    result.AppendLine($"Время отклика: {reply.RoundtripTime} мс");
                    result.AppendLine($"TTL: {reply.Options?.Ttl ?? 0}");
                    result.AppendLine($"Адрес: {reply.Address}");
                }

                txtResults.Text = result.ToString();
            }
            catch (Exception ex)
            {
                txtResults.Text = $"Ошибка при выполнении ping: {ex.Message}";
            }
        }

        private async void GetDnsInfo_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrEmpty(txtHost.Text))
            {
                MessageBox.Show("Сначала проанализируйте URL", "Информация", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            try
            {
                txtResults.Text = "Получение DNS информации...";

                IPHostEntry hostEntry = await Dns.GetHostEntryAsync(txtHost.Text);

                StringBuilder result = new StringBuilder();
                result.AppendLine($"DNS информация для {txtHost.Text}:");
                result.AppendLine($"Имя хоста: {hostEntry.HostName}");
                result.AppendLine("IP адреса:");

                foreach (IPAddress address in hostEntry.AddressList)
                {
                    result.AppendLine($"- {address} ({address.AddressFamily})");
                }

                txtResults.Text = result.ToString();
            }
            catch (Exception ex)
            {
                txtResults.Text = $"Ошибка при получении DNS информации: {ex.Message}";
            }
        }

        private async void AddToHistory(string url)
        {
            // Проверяем, нет ли уже такого URL в истории
            UrlHistoryItem existingItem = _urlHistory.FirstOrDefault(item => item.Url == url);
            if (existingItem != null)
            {
                // Если URL уже есть, обновляем время проверки и переносим в начало списка
                _urlHistory.Remove(existingItem);
            }

            // Добавляем новую запись в начало истории
            _urlHistory.Insert(0, new UrlHistoryItem
            {
                Url = url,
                CheckTime = DateTime.Now
            });

            // Ограничиваем историю 100 записями
            while (_urlHistory.Count > 100)
            {
                _urlHistory.RemoveAt(_urlHistory.Count - 1);
            }

            // Сохраняем историю в файл
            try
            {
                await _historyService.SaveUrlHistoryAsync(_urlHistory);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при сохранении истории: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void UrlHistoryList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (UrlHistoryList.SelectedItem is UrlHistoryItem selectedItem)
            {
                txtUrlInput.Text = selectedItem.Url;
            }
        }

        private async void ClearHistory_Click(object sender, RoutedEventArgs e)
        {
            if (MessageBox.Show("Вы уверены, что хотите очистить историю?", "Подтверждение",
                    MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
            {
                // Очищаем коллекцию
                _urlHistory.Clear();

                // Сохраняем пустую историю в файл
                try
                {
                    await _historyService.SaveUrlHistoryAsync(_urlHistory);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Ошибка при очистке истории: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }
    }

    // Классы для хранения информации
    public class NetworkInterfaceInfo
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public NetworkInterface NetworkInterface { get; set; }
    }

    public class UrlHistoryItem
    {
        public string Url { get; set; }
        public DateTime CheckTime { get; set; }
    }
}