// Класс для работы с JSON-файлом (создайте новый файл JsonHistoryService.cs)
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace NetworkAnalyzer
{
    public class JsonHistoryService
    {
        private readonly string _historyFilePath;

        public JsonHistoryService()
        {
            // Определяем путь к файлу JSON в папке с приложением
            string appDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "NetworkAnalyzer");

            // Создаем директорию, если она не существует
            if (!Directory.Exists(appDataPath))
                Directory.CreateDirectory(appDataPath);

            _historyFilePath = Path.Combine(appDataPath, "history.json");
        }

        public async Task SaveUrlHistoryAsync(ObservableCollection<UrlHistoryItem> history)
        {
            try
            {
                // Создаем список для сериализации
                List<UrlHistoryItem> historyList = history.ToList();

                // Сериализуем список в JSON
                string jsonString = JsonSerializer.Serialize(historyList, new JsonSerializerOptions
                {
                    WriteIndented = true
                });

                // Асинхронно записываем в файл
                await File.WriteAllTextAsync(_historyFilePath, jsonString);
            }
            catch (Exception ex)
            {
                throw new Exception($"Ошибка при сохранении истории: {ex.Message}", ex);
            }
        }

        public async Task<List<UrlHistoryItem>> LoadUrlHistoryAsync()
        {
            try
            {
                // Проверяем существование файла
                if (!File.Exists(_historyFilePath))
                    return new List<UrlHistoryItem>();

                // Читаем содержимое файла
                string jsonString = await File.ReadAllTextAsync(_historyFilePath);

                // Если файл пустой, возвращаем пустой список
                if (string.IsNullOrWhiteSpace(jsonString))
                    return new List<UrlHistoryItem>();

                // Десериализуем JSON в список
                List<UrlHistoryItem> history = JsonSerializer.Deserialize<List<UrlHistoryItem>>(jsonString);

                return history ?? new List<UrlHistoryItem>();
            }
            catch (Exception ex)
            {
                throw new Exception($"Ошибка при загрузке истории: {ex.Message}", ex);
            }
        }
    }
}