// NavigatorServer Program.cs
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

public class ConnectedClient
{
    public string SessionId { get; set; }
    public TcpClient TcpClient { get; set; }
    public WebSocket WebSocket { get; set; }
    public DateTime LastUdpMessageTime { get; set; }

    public ConnectedClient(TcpClient tcpClient)
    {
        SessionId = Guid.NewGuid().ToString();
        TcpClient = tcpClient;
        LastUdpMessageTime = DateTime.MinValue;
    }
}

public class NavigatorServer
{
    private static List<ConnectedClient> _clients = new List<ConnectedClient>();
    private static readonly object _clientsLock = new object();
    private static UdpClient _udpListener;
    private static Timer _webSocketUpdateTimer;
    private static Timer _eventOfTheDayTimer;
    private static Random _random = new Random();

    private const int TcpPort = 8888;
    private const int UdpPort = 8889;
    private const int WebSocketPort = 8890;

    public static async Task Main(string[] args)
    {
        Console.WriteLine("Navigator Server Starting...");

        var tcpTask = StartTcpListener();
        var udpTask = StartUdpListener();
        var webSocketTask = StartWebSocketListener();

        _webSocketUpdateTimer = new Timer(BroadcastWebSocketDynamicUpdate, null, TimeSpan.FromSeconds(10), TimeSpan.FromSeconds(30));
        _eventOfTheDayTimer = new Timer(BroadcastEventOfTheDay, null, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(2));

        Console.WriteLine($"TCP Server listening on port {TcpPort}");
        // Сообщения о запуске UDP и WebSocket теперь внутри их методов Start...
        Console.WriteLine("Server running.");

        try
        {
            await Task.WhenAll(tcpTask, udpTask, webSocketTask);
        }
        catch (Exception ex) { Console.WriteLine($"Critical error in server tasks: {ex.Message}"); }
        finally
        {
            _webSocketUpdateTimer?.Dispose();
            _eventOfTheDayTimer?.Dispose();
            _udpListener?.Close();
            Console.WriteLine("Server shutting down...");
        }
    }

    private static async Task StartTcpListener()
    {
        TcpListener listener = new TcpListener(IPAddress.Any, TcpPort);
        try
        {
            listener.Start();
        }
        catch (SocketException se)
        {
            Console.WriteLine($"[TCP Listener] ERROR starting on port {TcpPort}: {se.Message}");
            return;
        }

        while (true)
        {
            try
            {
                TcpClient client = await listener.AcceptTcpClientAsync();
                _ = HandleTcpClientAsync(client);
            }
            catch (ObjectDisposedException) { Console.WriteLine("TCP listener has been stopped."); break; }
            catch (Exception ex) { Console.WriteLine($"Error in TCP listener accept loop: {ex.Message}"); }
        }
        listener.Stop();
    }

    private static async Task HandleTcpClientAsync(TcpClient tcpClient)
    {
        var connectedClient = new ConnectedClient(tcpClient);
        lock (_clientsLock) { _clients.Add(connectedClient); }
        Console.WriteLine($"[TCP] Client connected: {connectedClient.SessionId} from {tcpClient.Client.RemoteEndPoint}");

        NetworkStream stream = tcpClient.GetStream();
        byte[] buffer = new byte[1024];
        int bytesRead;

        try
        {
            byte[] sessionIdMsg = Encoding.UTF8.GetBytes($"SESSION_ID:{connectedClient.SessionId}\n");
            await stream.WriteAsync(sessionIdMsg, 0, sessionIdMsg.Length);

            while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
            {
                string message = Encoding.UTF8.GetString(buffer, 0, bytesRead).Trim();
                Console.WriteLine($"[TCP] Recv from {connectedClient.SessionId}: '{message}'");
                string response = message.StartsWith("GET_MAP_DATA") ? "MAP_DATA:Initial map data...\n"
                                : message.StartsWith("GET_INFRASTRUCTURE") ? "INFRASTRUCTURE:Main roads...\n"
                                : "UNKNOWN_COMMAND\n";
                byte[] responseMsg = Encoding.UTF8.GetBytes(response);
                await stream.WriteAsync(responseMsg, 0, responseMsg.Length);
            }
        }
        catch (ObjectDisposedException) { /* Stream likely closed, normal disconnect */ }
        catch (System.IO.IOException ioex) when (ioex.InnerException is SocketException || ioex.Message.ToLower().Contains("forcibly closed"))
        { /* Connection reset or forcibly closed, normal disconnect */ }
        catch (Exception ex) { Console.WriteLine($"[TCP] Error with {connectedClient.SessionId}: {ex.Message}"); }
        finally
        {
            lock (_clientsLock) { _clients.Remove(connectedClient); }
            tcpClient.Close();
            Console.WriteLine($"[TCP] Client disconnected: {connectedClient.SessionId}");
        }
    }

    private static async Task StartUdpListener()
    {
        try
        {
            _udpListener = new UdpClient(UdpPort);
            Console.WriteLine($"[UDP Listener] Listening on port {UdpPort}");
        }
        catch (SocketException se)
        {
            Console.WriteLine($"[UDP Listener] ERROR starting on port {UdpPort}: {se.Message}. UDP unavailable.");
            return;
        }

        while (true)
        {
            try
            {
                UdpReceiveResult result = await _udpListener.ReceiveAsync();
                string message = Encoding.UTF8.GetString(result.Buffer).TrimEnd('\0');
                var parts = message.Split(new[] { ':' }, 2);
                if (parts.Length == 2)
                {
                    string sessionId = parts[0];
                    string data = parts[1];
                     Console.WriteLine($"[UDP] Recv from {sessionId} ({result.RemoteEndPoint}): {data}"); // Раскомментируйте для детального лога UDP
                    lock (_clientsLock)
                    {
                        var client = _clients.FirstOrDefault(c => c.SessionId == sessionId);
                        if (client != null) client.LastUdpMessageTime = DateTime.UtcNow;
                         else Console.WriteLine($"[UDP] Recv for unknown SessionId: {sessionId}"); // Раскомментируйте при необходимости
                    }
                }
                 else { Console.WriteLine($"[UDP] Malformed message from {result.RemoteEndPoint}: '{message}'"); } // Раскомментируйте при необходимости
            }
            catch (ObjectDisposedException) { Console.WriteLine("[UDP Listener] Stopped."); break; }
            catch (SocketException se) when (se.SocketErrorCode == SocketError.Interrupted || se.SocketErrorCode == SocketError.ConnectionReset || se.SocketErrorCode == SocketError.OperationAborted)
            { Console.WriteLine($"[UDP Listener] Socket operation ended (Code: {se.SocketErrorCode})."); break; }
            catch (Exception ex) { Console.WriteLine($"[UDP Listener] Error in receive loop: {ex.Message}"); }
        }
    }

    private static async Task StartWebSocketListener()
    {
        HttpListener listener = new HttpListener();
        string prefix = $"http://127.0.0.1:{WebSocketPort}/ws/";
        try
        {
            listener.Prefixes.Add(prefix);
            listener.Start();
            Console.WriteLine($"[WS Listener] Listening on {prefix}");
        }
        catch (HttpListenerException hlex)
        {
            Console.WriteLine($"[WS Listener] ERROR starting: {hlex.Message} (Code: {hlex.ErrorCode})");
            if (hlex.ErrorCode == 5) Console.WriteLine($"[WS Listener] Access Denied. Try admin or 'netsh http add urlacl url={prefix} user=EVERYONE_OR_YOUR_USER'");
            return;
        }

        while (true)
        {
            try
            {
                HttpListenerContext context = await listener.GetContextAsync();
                if (context.Request.IsWebSocketRequest) { _ = ProcessWebSocketRequestAsync(context); }
                else { context.Response.StatusCode = 400; context.Response.Close(); }
            }
            catch (HttpListenerException hlex) when (hlex.ErrorCode == 995 || hlex.Message.ToLower().Contains("aborted")) { Console.WriteLine("[WS Listener] Stopped."); break; }
            catch (ObjectDisposedException) { Console.WriteLine("[WS Listener] Stopped."); break; }
            catch (InvalidOperationException ioex) when (ioex.Message.ToLower().Contains("listener is not started")) { Console.WriteLine("[WS Listener] Stopped."); break; }
            catch (Exception ex) { Console.WriteLine($"[WS Listener] Error in accept loop: {ex.Message}"); }
        }
        try { listener.Stop(); } catch { /* ignored */ }
    }

    private static async Task ProcessWebSocketRequestAsync(HttpListenerContext context)
    {
        HttpListenerWebSocketContext wsContext = null;
        WebSocket webSocketInstance = null;
        string currentSessionIdForDebug = $"WS_Init_{context.Request.RemoteEndPoint}"; // Начальное значение

        try
        {
            wsContext = await context.AcceptWebSocketAsync(subProtocol: null);
            webSocketInstance = wsContext.WebSocket;
            Console.WriteLine($"[WS Process] Accepted for {context.Request.RemoteEndPoint}. Awaiting SessionID...");

            byte[] receiveBuffer = new byte[1024];
            WebSocketReceiveResult receiveResult = await webSocketInstance.ReceiveAsync(new ArraySegment<byte>(receiveBuffer), CancellationToken.None);

            if (receiveResult.MessageType == WebSocketMessageType.Close)
            { Console.WriteLine($"[WS Process] Client {context.Request.RemoteEndPoint} initiated close during handshake."); return; }

            string initMessage = Encoding.UTF8.GetString(receiveBuffer, 0, receiveResult.Count).Trim();

            bool proceed = false; string closeReason = "";
            if (initMessage.StartsWith("SESSION_ID:"))
            {
                string sessionId = initMessage.Substring("SESSION_ID:".Length);
                currentSessionIdForDebug = sessionId; // Обновляем ID для логов
                lock (_clientsLock)
                {
                    var client = _clients.FirstOrDefault(c => c.SessionId == sessionId);
                    if (client != null)
                    {
                        if (client.WebSocket == null || client.WebSocket.State != WebSocketState.Open)
                        { client.WebSocket = webSocketInstance; proceed = true; }
                        else { closeReason = "Session ID already has active WebSocket."; }
                    }
                    else { closeReason = "Session ID not found."; }
                }
                if (proceed)
                {
                    Console.WriteLine($"[WS] Associated: {sessionId}");
                    await webSocketInstance.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes("Welcome!")), WebSocketMessageType.Text, true, CancellationToken.None);
                }
                else { Console.WriteLine($"[WS] Denied {sessionId}: {closeReason}"); if (webSocketInstance.State == WebSocketState.Open) await webSocketInstance.CloseAsync(WebSocketCloseStatus.PolicyViolation, closeReason, CancellationToken.None); return; }
            }
            else
            {
                closeReason = "SESSION_ID required/malformed."; Console.WriteLine($"[WS] Denied {context.Request.RemoteEndPoint}: {closeReason} Recv: '{initMessage}'");
                if (webSocketInstance.State == WebSocketState.Open) await webSocketInstance.CloseAsync(WebSocketCloseStatus.PolicyViolation, closeReason, CancellationToken.None); return;
            }

            while (webSocketInstance.State == WebSocketState.Open) { await Task.Delay(1000); } // Keep alive
        }
        catch (WebSocketException wsex) { Console.WriteLine($"[WS Process] WebSocketException for {currentSessionIdForDebug}: {wsex.Message}"); }
        catch (Exception ex) { Console.WriteLine($"[WS Process] Error for {currentSessionIdForDebug}: {ex.Message}"); }
        finally
        {
            if (webSocketInstance != null)
            {
                if (webSocketInstance.State == WebSocketState.Open) { try { await webSocketInstance.CloseAsync(WebSocketCloseStatus.InternalServerError, "Cleanup", CancellationToken.None); } catch { /* ignored */ } }
                lock (_clientsLock)
                {
                    var c = _clients.FirstOrDefault(cl => cl.WebSocket == webSocketInstance);
                    if (c != null) { c.WebSocket = null; currentSessionIdForDebug = c.SessionId; } // Обновляем ID для лога отключения
                }
                webSocketInstance.Dispose();
            }
            Console.WriteLine($"[WS] Client disconnected/cleaned: {currentSessionIdForDebug}");
        }
    }

    private static void BroadcastWebSocketDynamicUpdate(object state)
    {
        string[] updates = { "TRAFFIC_ALERT:Heavy traffic...", "OBSTACLE_AHEAD:Construction...", "SPEED_CAMERA:Active...", "WEATHER_UPDATE:Fog..." };
        string message = $"DYNAMIC_UPDATE:{DateTime.UtcNow:HH:mm:ss}:{updates[_random.Next(updates.Length)]}";
        BroadcastToWebSockets(message);
    }

    private static void BroadcastEventOfTheDay(object state)
    {
        string[] events = { "GLOBAL_MAP_UPDATE:New version...", "MAJOR_INCIDENT:Pileup...", "PUBLIC_TRANSPORT_ALERT:Suspended...", "NEW_FEATURE:Voice command..." };
        string message = $"EVENT_OF_THE_DAY:{DateTime.UtcNow:HH:mm:ss}:{events[_random.Next(events.Length)]}";
        BroadcastToWebSockets(message);
    }

    private static async void BroadcastToWebSockets(string message)
    {
        List<WebSocket> activeSocketsCopy;
        lock (_clientsLock) { activeSocketsCopy = _clients.Where(c => c.WebSocket != null && c.WebSocket.State == WebSocketState.Open).Select(c => c.WebSocket).ToList(); }
        if (!activeSocketsCopy.Any()) return;

        byte[] messageBytes = Encoding.UTF8.GetBytes(message);
        var segment = new ArraySegment<byte>(messageBytes);
        var sendTasks = activeSocketsCopy.Select(ws => Task.Run(async () => {
            try { await ws.SendAsync(segment, WebSocketMessageType.Text, true, CancellationToken.None); }
            catch (Exception) { /* Optionally log send error to specific client, but avoid console spam */ }
        })).ToList();
        try { await Task.WhenAll(sendTasks); } catch { /* Errors handled in Task.Run */ }
    }
}