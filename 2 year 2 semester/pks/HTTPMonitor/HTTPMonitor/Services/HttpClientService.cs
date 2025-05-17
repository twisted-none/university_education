using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using HTTPMonitor.Models;

namespace HTTPMonitor.Services
{
    public class HttpClientService
    {
        private readonly HttpClient _httpClient;
        private readonly LoggingService _loggingService;

        public HttpClientService(LoggingService loggingService)
        {
            _httpClient = new HttpClient();
            _loggingService = loggingService ?? throw new ArgumentNullException(nameof(loggingService));
        }

        public async Task<string> SendRequestAsync(string url, string method, string? body = null)
        {
            // Проверка входных параметров
            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentException("URL cannot be empty", nameof(url));

            if (string.IsNullOrWhiteSpace(method))
                throw new ArgumentException("Method cannot be empty", nameof(method));

            var requestLog = new RequestLog
            {
                Method = method,
                Url = url,
                Body = body ?? string.Empty, // Заменяем null на пустую строку
                Type = RequestType.Outgoing
            };

            var startTime = DateTime.Now;
            HttpResponseMessage? response = null;

            try
            {
                var request = new HttpRequestMessage(new HttpMethod(method), url)
                {
                    Content = (!string.IsNullOrEmpty(body) && (method == "POST" || method == "PUT" || method == "PATCH"))
                        ? new StringContent(body, Encoding.UTF8, "application/json")
                        : null
                };

                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var headers = new StringBuilder();
                foreach (var header in request.Headers)
                {
                    headers.AppendLine($"{header.Key}: {string.Join(", ", header.Value)}");
                }
                requestLog.Headers = headers.ToString();

                response = await _httpClient.SendAsync(request);
                string responseContent = await response.Content.ReadAsStringAsync();

                requestLog.StatusCode = response.StatusCode;
                requestLog.Response = responseContent;

                return responseContent;
            }
            catch (Exception ex)
            {
                requestLog.StatusCode = HttpStatusCode.InternalServerError;
                requestLog.Response = $"Error: {ex.Message}";
                throw; // Пробрасываем исключение дальше
            }
            finally
            {
                requestLog.ProcessingTimeMs = (long)(DateTime.Now - startTime).TotalMilliseconds;
                await _loggingService.LogRequestAsync(requestLog);
                response?.Dispose();
            }
        }
    }
}