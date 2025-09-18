using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Xml.Linq;

namespace StorageManagement
{
    class Program
    {
        private static List<Storage> storages = new List<Storage>();
        private static List<Product> products = new List<Product>();
        private static int nextStorageId = 1;
        private static int nextProductId = 1;

        static void Main(string[] args)
        {


            while (true)
            {
                Console.WriteLine("\n=== Система складского учета ===");
                Console.WriteLine("1. Инициализировать склады");
                Console.WriteLine("2. Инициализировать продукты");
                Console.WriteLine("3. Создать первую поставку");
                Console.WriteLine("4. Создать вторую поставку");
                Console.WriteLine("5. Создать третью поставку");
                Console.WriteLine("6. Оптимизация помещения");
                Console.WriteLine("7. Перемещение продуктов со склада");
                Console.WriteLine("8. Анализ складской сети");
                Console.WriteLine("9. Метод перемещения товаров с истекшим сроком годности на утилизацию");
                Console.WriteLine("10. Подсчет стоимости товара");

                Console.Write("\nВыберите действие: ");
                string choice = Console.ReadLine();

                switch (choice)
                {
                    case "1":
                        InitializeStorages();
                        break;
                    case "2":
                        InitializeProducts();
                        break;
                    case "3":
                        CreateFirstPost();
                        break;
                    case "4":
                        CreateSecondPost();
                        break;
                    case "5":
                        CreateThirdPost();
                        break;
                    case "6":
                        OptimizeStorages();
                        break;
                    case "7":
                        MovingProduct();
                        break;
                    case "8":
                        AnalizeNetworks();
                        break;
                    case "9":
                        UtilizeProducts();
                        break;
                    case "10":
                        CountPrices();
                        break;
                }
            }
        }

        private static void InitializeStorages()
        {
            storages.Add(new Storage(nextStorageId++, "общий", 10000, "ул. Складская, 1"));
            storages.Add(new Storage(nextStorageId++, "холодный", 100, "ул. Складская, 2"));
            storages.Add(new Storage(nextStorageId++, "холодный", 500, "ул. Складская, 23"));
            storages.Add(new Storage(nextStorageId++, "сортировочный", 30000, "ул. Складская, 3"));
            storages.Add(new Storage(nextStorageId++, "утилизация", 20000, "ул. Складская, 4"));
            Console.WriteLine("Инициализированы 5 склада:");
            ViewAllStorages();

        }

        private static void InitializeProducts()
        {
            products.Add(new Product(nextProductId++, nextProductId, "Ananas", 500000, 23, 33));
            products.Add(new Product(nextProductId++, nextProductId, "Bratishkin", 200000, 500, 33));
            products.Add(new Product(nextProductId++, nextProductId, "aaaa", 250, 500, 35));
            products.Add(new Product(nextProductId++, nextProductId, "bbb", 20, 50, 37));
            products.Add(new Product(nextProductId++, nextProductId, "Grusha", 100, 5, 2));
            products.Add(new Product(nextProductId++, nextProductId, "yabloko", 10, 50, 20));
            products.Add(new Product(nextProductId++, nextProductId, "ttt", 102, 50, 2));
            products.Add(new Product(nextProductId++, nextProductId, "Vovschik", 200, 1000, -5));
            products.Add(new Product(nextProductId++, nextProductId, "Mamscihikis", 5, 50, 20));

            Console.WriteLine("Инициализированы 9 продуктов:");
            ViewAllProducts();

        }

        private static void CreateFirstPost()
        {
            Console.WriteLine("\nПервая поставка товаров:");
            List<Product> delivery = new List<Product>();

            for (int i = 1; i < 5; i++)
            {

                Product product = Product.FindProductById(i);

                delivery.Add(product);
                Console.WriteLine("\n" + product.GetProductInfo());
                Console.WriteLine();

            }

            OptimizeDelivery(delivery);

        }

        private static void CreateSecondPost()
        {
            Console.WriteLine("\nВторая поставка товаров:");
            List<Product> delivery = new List<Product>();

            for (int i = 5; i < 10; i++)
            {

                Product product = Product.FindProductById(i);

                delivery.Add(product);
                Console.WriteLine("\n" + product.GetProductInfo());
                Console.WriteLine();

            }

            OptimizeDelivery(delivery);

        }

        private static void CreateThirdPost()
        {
            Console.WriteLine("\nТретья поставка товаров:");
            List<Product> delivery = new List<Product>();

            for (int i = 1; i < 10; i++)
            {

                Product product = Product.FindProductById(i);

                delivery.Add(product);
                Console.WriteLine("\n" + product.GetProductInfo());
                Console.WriteLine();

            }

            OptimizeDelivery(delivery);

        }

        private static void OptimizeStorages() 
        {

            Console.WriteLine("Оптимизируем сортировочный склад №4");
            OptimizeProducts(4);

        }

        private static void MovingProduct()
        {
            Console.WriteLine("Перемещаем товары со склада на склад:");

            MoveProducts(3, 1, 5);
            MoveProducts(3, 4, 6);
            MoveProducts(1, 5, 1);
            MoveProducts(1, 3, 2);
            MoveProducts(1, 4, 4);

        }

        private static void AnalizeNetworks()
        {
            Console.WriteLine("\nАнализ складской сети");

            foreach (var storage in storages)
            {
                Console.WriteLine($"\nАнализ склада #{storage.Id} ({storage.Type}):");
                bool hasViolations = false;

                var expiredProducts = storage.Products.Where(p => p.ExpirationDays <= 0).ToList();
                if (expiredProducts.Any())
                {
                    hasViolations = true;
                    Console.WriteLine("- Требуется перемещение просроченных товаров на склад утилизации");
                }

                if (storage.Type == "сортировочный")
                {
                    var needsOptimization = storage.Products.Any(p => p.ExpirationDays >= 30) ||
                                          storage.Products.Any(p => p.ExpirationDays < 30);
                    if (needsOptimization)
                    {
                        hasViolations = true;
                        Console.WriteLine("- Требуется оптимизационное перемещение товаров");
                    }
                }

                if (storage.Type == "общий")
                {
                    var shortTermProducts = storage.Products.Where(p => p.ExpirationDays < 30).ToList();
                    if (shortTermProducts.Any())
                    {
                        hasViolations = true;
                        Console.WriteLine("- Обнаружены товары с коротким сроком хранения на общем складе");
                    }
                }
                else if (storage.Type == "холодный")
                {
                    var longTermProducts = storage.Products.Where(p => p.ExpirationDays >= 30).ToList();
                    if (longTermProducts.Any())
                    {
                        hasViolations = true;
                        Console.WriteLine("- Обнаружены товары с длительным сроком хранения на холодном складе");
                    }
                }

                if (!hasViolations)
                {
                    Console.WriteLine("Статус: нарушений нет");
                }
                else
                {
                    Console.WriteLine("Статус: есть нарушения");
                }

                double occupancyPercentage = (storage.Volume - storage.FreeVolume) / storage.Volume * 100;
                Console.WriteLine($"Загруженность склада: {occupancyPercentage:F1}%");
            }

        }

        private static void UtilizeProducts()
        {
            List<Storage> storagesToCheck = storages.Where(s => s.Type != "утилизация").ToList(); ;

            var disposalStorage = storages.FirstOrDefault(s => s.Type == "утилизация");
            if (disposalStorage == null)
            {
                Console.WriteLine("Ошибка: не найден склад утилизации!");
                return;
            }

            foreach (var storage in storagesToCheck)
            {
                var expiredProducts = storage.Products.Where(p => p.ExpirationDays <= 0).ToList();
                foreach (var product in expiredProducts)
                {
                    if (disposalStorage.FreeVolume >= product.UnitVolume)
                    {
                        storage.RemoveProduct(product);
                        disposalStorage.AddProduct(product);
                        Console.WriteLine($"Логирование: Товар '{product.Name}', объем {product.UnitVolume}, перемещен со склада #{storage.Id} на склад утилизации #{disposalStorage.Id}");
                    }
                    else
                    {
                        Console.WriteLine($"Предупреждение: Недостаточно места на складе утилизации для товара {product.Name}!");
                    }
                }
            }

        }

        private static void CountPrices()
        {
            Console.WriteLine("\nПодсчет стоимости товаров по всей складской сети:");

            double totalNetworkValue = 0;
            int totalNetworkProductCount = 0;
            double totalNetworkVolume = 0;

            foreach (var storage in storages)
            {
                double storageValue = storage.Products.Sum(p => p.UnitPrice);
                int storageProductCount = storage.Products.Count();
                double storageVolume = storage.Products.Sum(p => p.UnitVolume);

                Console.WriteLine($"\nСклад #{storage.Id}, Адрес: {storage.Address}");
                Console.WriteLine($"Общая стоимость товаров: {storageValue:F2}");
                Console.WriteLine($"Количество товаров: {storageProductCount}");
                Console.WriteLine($"Общий объем товаров: {storageVolume:F2}");


                if (storage.Type != "утилизация")
                {
                    totalNetworkValue += storageValue;
                    totalNetworkProductCount += storageProductCount;
                    totalNetworkVolume += storageVolume;
                }
            }

            Console.WriteLine("\n=== Итого по всей складской сети ===");
            Console.WriteLine($"Общая стоимость всех товаров без учета склада утилизации: {totalNetworkValue:F2}");
            Console.WriteLine($"Общее количество товаров без учета склада утилизации: {totalNetworkProductCount}");
            Console.WriteLine($"Общий объем товаров без учета склада утилизации: {totalNetworkVolume:F2}");
            Console.WriteLine($"Средняя стоимость товара без учета склада утилизации: {(totalNetworkProductCount > 0 ? totalNetworkValue / totalNetworkProductCount : 0):F2}");

        }

        private static void ViewAllStorages()
        {
            Console.WriteLine("\nСписок всех складов:");
            foreach (var storage in storages)
            {
                Console.WriteLine($"ID: {storage.Id}, Тип: {storage.Type}, Адрес: {storage.Address}");
            }
        }

        private static void ViewAllProducts()
        {
            Console.WriteLine("\nСписок всех продуктов:");
            foreach (var product in products)
            {
                Console.WriteLine($"Товар #{product.Id}\n" +
                   $"Поставщик: #{product.SupplierId}\n" +
                   $"Название: {product.Name}\n" +
                   $"Объем единицы: {product.UnitVolume} м³\n" +
                   $"Цена единицы: {product.UnitPrice} руб.\n" +
                   $"Дней до истечения срока: {product.ExpirationDays}");
            }
        }

        private static void OptimizeDelivery(List<Product> delivery)
        {
            bool allLongTerm = delivery.All(p => p.ExpirationDays >= 30);
            bool allShortTerm = delivery.All(p => p.ExpirationDays < 30);
            string targetType;

            if (allLongTerm)
                targetType = "общий";
            else if (allShortTerm)
                targetType = "холодный";
            else
                targetType = "сортировочный";

            var suitableStorages = storages.Where(s => s.Type == targetType).OrderByDescending(s => s.FreeVolume).ToList();
            double totalVolume = delivery.Sum(p => p.UnitVolume);

            Console.WriteLine($"\nНеобходимый тип склада: {targetType}");
            Console.WriteLine($"Общий объем поставки: {totalVolume}");

            foreach (var storage in suitableStorages)
            {
                foreach (var product in delivery.ToList())
                {
                    if (storage.AddProduct(product))
                    {
                        Console.WriteLine($"Логирование: Товар '{product.Name}', объем {product.UnitVolume}, размещен на складе #{storage.Id}");
                        delivery.Remove(product);
                    }
                }
            }

            if (delivery.Count > 0)
            {
                Console.WriteLine("\nНе удалось разместить все товары! Недостаточно места на складах.");
            }
        }

        private static void OptimizeProducts(int storageId)
        {
             var storage = storages.FirstOrDefault(s => s.Id == storageId && s.Type == "сортировочный");
             if (storage == null)
             {
                Console.WriteLine("Склад не найден или не является сортировочным!");
                return;
             }
             

            var products = storage.Products.ToList();
            foreach (var product in products)
            {
                string targetType = "";

                if (product.ExpirationDays >= 30)
                {
                    targetType = "общий";
                }
                else if (product.ExpirationDays <= 30 && product.ExpirationDays >= 0)
                {
                    targetType = "холодный";
                }
                else
                {
                    targetType = "утилизация";
                }

                var targetStorage = storages
                    .Where(s => s.Type == targetType && s.FreeVolume >= product.UnitVolume)
                    .OrderByDescending(s => s.FreeVolume)
                    .FirstOrDefault();

                if (targetStorage != null)
                {
                    storage.RemoveProduct(product);
                    targetStorage.AddProduct(product);
                    Console.WriteLine($"Логирование: Товар '{product.Name}', объем {product.UnitVolume}, перемещен со склада #{storage.Id} на склад #{targetStorage.Id}");
                }
            }
            

        }

        private static void MoveProducts(int sourceId, int targetId, int productId)
        {
            
            var sourceStorage = storages.FirstOrDefault(s => s.Id == sourceId);
            var targetStorage = storages.FirstOrDefault(s => s.Id == targetId);

            if (sourceStorage == null || targetStorage == null)
            {
                Console.WriteLine("Один из складов не найден!");
                return;
            }

            var product = sourceStorage.Products.FirstOrDefault(p => p.Id == productId);

            
            if (targetStorage.FreeVolume >= product.UnitVolume)
            {
                sourceStorage.RemoveProduct(product);
                targetStorage.AddProduct(product);
                Console.WriteLine($"Логирование: Товар '{product.Name}', объем {product.UnitVolume}, перемещен со склада #{sourceStorage.Id} на склад #{targetStorage.Id}");
            }
            else
            {
                Console.WriteLine("Недостаточно места на складе-назначении!");
            }

        }

    }
}
