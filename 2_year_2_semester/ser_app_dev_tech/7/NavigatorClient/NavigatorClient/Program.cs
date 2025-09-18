// NavigatorClient Program.cs
using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

public class ServerDetails
{
    public string IpAddress { get; set; }
    public int TcpPort { get; set; }
    public int UdpPort { get; set; }
    public int WebSocketPort { get; set; }
    public ServerDetails(string ip, int tcp, int udp, int ws) { IpAddress = ip; TcpPort = tcp; UdpPort = udp; WebSocketPort = ws; }
    public override string ToString() => $"{IpAddress} (TCP:{TcpPort}, UDP:{UdpPort}, WS:{WebSocketPort})";
}

public class NavigatorClient
{
    private static TcpClient _tcpClient;
    private static NetworkStream _tcpStream;
    private static UdpClient _udpClient;
    private static ClientWebSocket _webSocketClient;
    private static string _sessionId;
    private static ServerDetails _currentServer;
    private static List<string> _eventCache = new List<string>(10);
    private const int CacheSize = 10;
    private static List<ServerDetails> _serverList = new List<ServerDetails>();

    public static async Task Main(string[] args)
    {
        Console.WriteLine("Navigator Client"); Console.WriteLine("----------------");
        ManageServers();
        if (_currentServer == null) { Console.WriteLine("No server selected. Exiting."); return; }

        try
        {
            _tcpClient = new TcpClient();
            Console.WriteLine($"[TCP] Connecting to {_currentServer.IpAddress}:{_currentServer.TcpPort}...");
            await _tcpClient.ConnectAsync(_currentServer.IpAddress, _currentServer.TcpPort);
            _tcpStream = _tcpClient.GetStream();
            Console.WriteLine($"[TCP] Connected.");

            _ = ListenForTcpMessagesAsync(); // Запускаем в фоне

            var ctsSession = new CancellationTokenSource(TimeSpan.FromSeconds(10));
            Console.WriteLine("[TCP] Waiting for Session ID...");
            while (string.IsNullOrEmpty(_sessionId) && !ctsSession.IsCancellationRequested && _tcpClient.Connected) { await Task.Delay(100); }
            ctsSession.Dispose();

            if (string.IsNullOrEmpty(_sessionId)) { Console.WriteLine("[TCP] Failed to receive Session ID. Exiting."); return; }
            Console.WriteLine($"[TCP] Session ID: {_sessionId}");

            _udpClient = new UdpClient();
            Console.WriteLine($"[UDP] Ready to send to {_currentServer.IpAddress}:{_currentServer.UdpPort}");

            _webSocketClient = new ClientWebSocket();
            Uri wsUri = new Uri($"ws://{_currentServer.IpAddress}:{_currentServer.WebSocketPort}/ws/");
            Console.WriteLine($"[WS] Connecting to: {wsUri}");
            await _webSocketClient.ConnectAsync(wsUri, CancellationToken.None);
            Console.WriteLine($"[WS] Connected.");

            string wsSessionMsg = $"SESSION_ID:{_sessionId}";
            await _webSocketClient.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(wsSessionMsg)), WebSocketMessageType.Text, true, CancellationToken.None);
            Console.WriteLine($"[WS] Session ID sent.");

            _ = ListenForWebSocketMessagesAsync(); // Запускаем в фоне
            _ = SendUdpPositionUpdatesAsync(); // Запускаем в фоне

            Console.WriteLine("\nEnter commands: 'map', 'infra', 'cache', 'exit'");
            Console.Write("> "); string input;
            while ((input = Console.ReadLine()?.Trim().ToLower()) != "exit")
            {
                if (string.IsNullOrEmpty(input)) { Console.Write("> "); continue; }
                if (input == "map") await SendTcpMessageAsync("GET_MAP_DATA");
                else if (input == "infra") await SendTcpMessageAsync("GET_INFRASTRUCTURE");
                else if (input == "cache") DisplayCache();
                else Console.WriteLine("Unknown command.");
                Console.Write("> ");
            }
        }
        catch (Exception ex) { Console.WriteLine($"ERROR: {ex.GetType().Name} - {ex.Message}"); }
        finally
        {
            Console.WriteLine("Client disconnecting...");
            _tcpClient?.Close(); _tcpStream?.Dispose();
            _udpClient?.Close();
            if (_webSocketClient?.State == WebSocketState.Open)
            { try { await _webSocketClient.CloseAsync(WebSocketCloseStatus.NormalClosure, "Client disconnect", CancellationToken.None); } catch { /* ignored */ } }
            _webSocketClient?.Dispose();
            Console.WriteLine("Client disconnected. Press any key to exit.");
            Console.ReadKey(true);
        }
    }

    private static void ManageServers()
    {
        _serverList.Add(new ServerDetails("127.0.0.1", 8888, 8889, 8890));
        while (true)
        {
            Console.WriteLine("\nServer Management:");
            if (_serverList.Any()) { for (int i = 0; i < _serverList.Count; i++) Console.WriteLine($"{i + 1}. {_serverList[i]}"); }
            else Console.WriteLine("No servers configured.");
            Console.WriteLine("Options: 'add', 'del <num>', 'sel <num>', 'done'"); Console.Write("Manage > ");
            string cmd = Console.ReadLine()?.Trim().ToLower();

            if (cmd == "add")
            {
                Console.Write("IP (def: 127.0.0.1): "); string ip = Console.ReadLine()?.Trim(); ip = string.IsNullOrEmpty(ip) ? "127.0.0.1" : ip;
                Console.Write("TCP (def: 8888): "); int.TryParse(Console.ReadLine(), out int tcpP); tcpP = tcpP == 0 ? 8888 : tcpP;
                Console.Write("UDP (def: 8889): "); int.TryParse(Console.ReadLine(), out int udpP); udpP = udpP == 0 ? 8889 : udpP;
                Console.Write("WS (def: 8890): "); int.TryParse(Console.ReadLine(), out int wsP); wsP = wsP == 0 ? 8890 : wsP;
                _serverList.Add(new ServerDetails(ip, tcpP, udpP, wsP));
            }
            else if (cmd.StartsWith("del ") && _serverList.Any()) { if (int.TryParse(cmd.Substring(3).Trim(), out int delN) && delN > 0 && delN <= _serverList.Count) _serverList.RemoveAt(delN - 1); else Console.WriteLine("Invalid num."); }
            else if (cmd.StartsWith("sel ") && _serverList.Any()) { if (int.TryParse(cmd.Substring(3).Trim(), out int selN) && selN > 0 && selN <= _serverList.Count) { _currentServer = _serverList[selN - 1]; Console.WriteLine($"Selected: {_currentServer}"); break; } else Console.WriteLine("Invalid num."); }
            else if (cmd == "done") { if (_currentServer == null && _serverList.Any()) { _currentServer = _serverList.First(); Console.WriteLine($"Defaulted: {_currentServer}"); } else if (_currentServer == null) { Console.WriteLine("No servers. Add one."); continue; } break; }
            else if (!_serverList.Any() && cmd != "add") Console.WriteLine("List empty. Add server.");
            else if (!string.IsNullOrEmpty(cmd)) Console.WriteLine("Unknown cmd.");
        }
    }

    private static async Task ListenForTcpMessagesAsync()
    {
        byte[] buffer = new byte[4096];
        try
        {
            while (_tcpClient != null && _tcpClient.Connected && _tcpStream != null)
            {
                int bytesRead = await _tcpStream.ReadAsync(buffer, 0, buffer.Length);
                if (bytesRead == 0) { Console.WriteLine("\n[TCP Recv] Server disconnected."); break; }
                string message = Encoding.UTF8.GetString(buffer, 0, bytesRead).Trim();
                Console.WriteLine($"\n[TCP Recv] '{message}'"); AddToCache($"[TCP Recv] {message}");
                if (message.StartsWith("SESSION_ID:")) { _sessionId = message.Substring("SESSION_ID:".Length); }
            }
        }
        catch (ObjectDisposedException) { /* Normal on client close */ }
        catch (System.IO.IOException) { /* Normal on client close or server disconnect */ }
        catch (Exception ex) { Console.WriteLine($"[TCP Listen ERROR] {ex.Message}"); }
        // Console.WriteLine("[TCP Listener] Stopped."); // Может быть излишним, если клиент просто завершается
    }

    private static async Task SendTcpMessageAsync(string message)
    {
        if (_tcpClient == null || !_tcpClient.Connected || _tcpStream == null) { Console.WriteLine("[TCP] Not connected."); return; }
        try
        {
            byte[] messageBytes = Encoding.UTF8.GetBytes(message + "\n");
            await _tcpStream.WriteAsync(messageBytes, 0, messageBytes.Length);
            // Console.WriteLine($"[TCP Sent] '{message}'"); // Можно раскомментировать при необходимости
        }
        catch (Exception ex) { Console.WriteLine($"[TCP Send ERROR] {ex.Message}"); }
    }

    private static async Task SendUdpPositionUpdatesAsync()
    {
        Random rnd = new Random(); double lat = 34.0522; double lon = -118.2437; float heading = 0.0f;
        while (true) // Этот цикл будет прерван при закрытии клиента через finally блок Main
        {
            if (string.IsNullOrEmpty(_sessionId) || _udpClient == null || _currentServer == null) { await Task.Delay(1000); continue; }

            lat += (rnd.NextDouble() - 0.5) * 0.001; lon += (rnd.NextDouble() - 0.5) * 0.001; heading = (float)(rnd.NextDouble() * 360.0);
            string positionData = $"{lat:F4},{lon:F4},{heading:F1}"; string udpMessage = $"{_sessionId}:{positionData}";
            byte[] datagram = Encoding.UTF8.GetBytes(udpMessage);

            try
            {
                await _udpClient.SendAsync(datagram, datagram.Length, _currentServer.IpAddress, _currentServer.UdpPort);
                AddToCache($"[UDP Sent] Pos: {positionData}");
                // Console.WriteLine($"[UDP Sent] To {_currentServer.IpAddress}:{_currentServer.UdpPort}"); // Раскомментировать для детального лога
            }
            catch (ObjectDisposedException) { break; } // UdpClient закрыт
            catch (SocketException) { /* Может возникать при закрытии, игнорируем для чистоты вывода */ break; }
            catch (Exception ex) { Console.WriteLine($"[UDP Send ERROR] {ex.Message}"); }
            await Task.Delay(2000);
        }
        // Console.WriteLine("[UDP] Position updates stopped."); // Может быть излишним
    }

    private static async Task ListenForWebSocketMessagesAsync()
    {
        byte[] buffer = new byte[2048];
        try
        {
            while (_webSocketClient != null && _webSocketClient.State == WebSocketState.Open)
            {
                var result = await _webSocketClient.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close)
                { Console.WriteLine($"[WS] Server closed. Status: {result.CloseStatus}"); break; }
                string message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                Console.WriteLine($"\n[WS Recv] '{message}'"); AddToCache($"[WS Recv] {message}");
            }
        }
        catch (WebSocketException wsex) when (wsex.WebSocketErrorCode == WebSocketError.ConnectionClosedPrematurely || (_webSocketClient != null && _webSocketClient.State != WebSocketState.Open))
        { /* Normal if connection is closed by server or client exits */ }
        catch (ObjectDisposedException) { /* Normal on client close */ }
        catch (Exception ex) { Console.WriteLine($"[WS Listen ERROR] {ex.Message}"); }
        // Console.WriteLine("[WS Listener] Stopped."); // Может быть излишним
    }

    private static void AddToCache(string eventMessage) { lock (_eventCache) { if (_eventCache.Count >= CacheSize) _eventCache.RemoveAt(0); _eventCache.Add($"[{DateTime.Now:HH:mm:ss}] {eventMessage}"); } }
    private static void DisplayCache() { Console.WriteLine("\n--- Recent Event Cache ---"); lock (_eventCache) { if (!_eventCache.Any()) Console.WriteLine("Cache is empty."); foreach (var item in _eventCache) Console.WriteLine(item); } Console.WriteLine("------------------------"); }
}