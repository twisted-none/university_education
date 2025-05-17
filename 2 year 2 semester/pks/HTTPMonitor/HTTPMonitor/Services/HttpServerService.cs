using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using HTTPMonitor.Models;

namespace HTTPMonitor.Services
{
    public class HttpServerService
    {
        private readonly HttpListener _listener;
        private readonly LoggingService _loggingService;
        private readonly StatisticsService _statisticsService;
        private readonly List<MessageData> _messages;
        private CancellationTokenSource? _cancellationTokenSource;
        private bool _isRunning;

        public event EventHandler<string>? ServerStatusChanged;

        public bool IsRunning => _isRunning;
        public int Port { get; private set; }

        public HttpServerService(LoggingService loggingService, StatisticsService statisticsService)
        {
            _loggingService = loggingService ?? throw new ArgumentNullException(nameof(loggingService));
            _statisticsService = statisticsService ?? throw new ArgumentNullException(nameof(statisticsService));
            _listener = new HttpListener();
            _messages = new List<MessageData>();
        }

        public async Task StartAsync(int port)
        {
            if (_isRunning)
                return;

            Port = port;
            _listener.Prefixes.Clear();
            _listener.Prefixes.Add($"http://localhost:{port}/");
            _listener.Start();
            _isRunning = true;
            _cancellationTokenSource = new CancellationTokenSource();

            NotifyServerStatus($"Server started on port {port}");

            try
            {
                await Task.Run(() => ProcessRequestsAsync(_cancellationTokenSource.Token),
                    _cancellationTokenSource.Token);
            }
            catch (TaskCanceledException)
            {
                // Ожидаемое исключение при остановке сервера
            }
        }

        public void Stop()
        {
            if (!_isRunning)
                return;

            _cancellationTokenSource?.Cancel();
            _listener.Stop();
            _isRunning = false;

            NotifyServerStatus("Server stopped");
        }

        private async Task ProcessRequestsAsync(CancellationToken cancellationToken)
        {
            try
            {
                while (_isRunning && !cancellationToken.IsCancellationRequested)
                {
                    var context = await _listener.GetContextAsync().ConfigureAwait(false);
                    if (context == null) continue;

                    // Process request in a separate task
                    _ = Task.Run(() => HandleRequestAsync(context, cancellationToken), cancellationToken);
                }
            }
            catch (HttpListenerException ex) when (ex.ErrorCode == 995) // ERROR_OPERATION_ABORTED
            {
                // Ожидаемое при остановке сервера
            }
            catch (Exception ex)
            {
                NotifyServerStatus($"Server error: {ex.Message}");
            }
        }

        private async Task HandleRequestAsync(HttpListenerContext context, CancellationToken cancellationToken)
        {
            if (context.Request == null || context.Response == null)
                return;

            var request = context.Request;
            var response = context.Response;

            var requestLog = new RequestLog
            {
                Method = request.HttpMethod ?? "UNKNOWN",
                Url = request.Url?.ToString() ?? string.Empty,
                Type = RequestType.Incoming
            };

            var startTime = DateTime.Now;
            var headers = new StringBuilder();

            if (request.Headers != null)
            {
                foreach (var key in request.Headers.AllKeys)
                {
                    if (key == null) continue;
                    headers.AppendLine($"{key}: {request.Headers[key]}");
                }
            }
            requestLog.Headers = headers.ToString();

            // Read request body if present
            if (request.HasEntityBody && request.InputStream != null)
            {
                using (var reader = new StreamReader(request.InputStream, request.ContentEncoding))
                {
                    requestLog.Body = await reader.ReadToEndAsync().ConfigureAwait(false);
                }
            }

            try
            {
                string responseContent = string.Empty;

                switch (request.HttpMethod)
                {
                    case "GET":
                        responseContent = HandleGetRequest();
                        response.StatusCode = (int)HttpStatusCode.OK;
                        break;
                    case "POST":
                        responseContent = await HandlePostRequestAsync(requestLog.Body);
                        response.StatusCode = (int)HttpStatusCode.Created;
                        break;
                    default:
                        responseContent = "Method not supported";
                        response.StatusCode = (int)HttpStatusCode.MethodNotAllowed;
                        break;
                }

                requestLog.StatusCode = (HttpStatusCode)response.StatusCode;
                requestLog.Response = responseContent;

                byte[] buffer = Encoding.UTF8.GetBytes(responseContent);
                response.ContentLength64 = buffer.Length;
                response.ContentType = "application/json";

                if (response.OutputStream != null)
                {
                    await response.OutputStream.WriteAsync(buffer, 0, buffer.Length, cancellationToken)
                        .ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                requestLog.StatusCode = HttpStatusCode.InternalServerError;
                requestLog.Response = ex.Message;

                byte[] buffer = Encoding.UTF8.GetBytes($"{{\"error\": \"{ex.Message}\"}}");
                response.ContentLength64 = buffer.Length;
                response.ContentType = "application/json";

                if (response.OutputStream != null)
                {
                    await response.OutputStream.WriteAsync(buffer, 0, buffer.Length, cancellationToken)
                        .ConfigureAwait(false);
                }
            }
            finally
            {
                requestLog.ProcessingTimeMs = (long)(DateTime.Now - startTime).TotalMilliseconds;
                await _loggingService.LogRequestAsync(requestLog).ConfigureAwait(false);
                _statisticsService.RecordRequest(requestLog);
                response.Close();
            }
        }

        private string HandleGetRequest()
        {
            var stats = _statisticsService.Statistics;
            var responseData = new
            {
                uptime = stats.Uptime.ToString(),
                startTime = stats.StartTime.ToString(),
                totalRequests = stats.TotalRequests,
                getRequests = stats.GetRequests,
                postRequests = stats.PostRequests,
                averageProcessingTime = stats.AverageProcessingTime,
                messageCount = _messages.Count
            };

            return JsonSerializer.Serialize(responseData, new JsonSerializerOptions { WriteIndented = true });
        }

        private Task<string> HandlePostRequestAsync(string? requestBody)
        {
            try
            {
                if (string.IsNullOrEmpty(requestBody))
                {
                    throw new ArgumentException("Request body is empty");
                }

                var messageData = JsonSerializer.Deserialize<MessageData>(requestBody) ??
                    throw new FormatException("Invalid message data");

                if (string.IsNullOrEmpty(messageData.Message))
                {
                    throw new ArgumentException("Message field is required");
                }

                messageData.Id = Guid.NewGuid();
                messageData.CreatedAt = DateTime.Now;

                _messages.Add(messageData);

                var response = new
                {
                    id = messageData.Id,
                    message = messageData.Message,
                    createdAt = messageData.CreatedAt
                };

                return Task.FromResult(JsonSerializer.Serialize(response, new JsonSerializerOptions { WriteIndented = true }));
            }
            catch (JsonException)
            {
                throw new FormatException("Invalid JSON format");
            }
        }



        private void NotifyServerStatus(string message)
        {
            ServerStatusChanged?.Invoke(this, message);
        }
    }
}