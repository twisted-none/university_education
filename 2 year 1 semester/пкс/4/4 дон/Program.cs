using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    private static List<Dish> _dishes = new List<Dish>();
    private static List<Order> _orders = new List<Order>();

    static void Main(string[] args)
    {
        bool isRunning = true;
        while (isRunning)
        {
            Console.WriteLine("Добро пожаловать в меню программы!");
            Console.WriteLine("Выберите что хотите сделать:");
            Console.WriteLine("1. Действия с блюдами");
            Console.WriteLine("2. Действия с заказами");
            Console.WriteLine("3. Меню ресторана");
            Console.WriteLine("4. Полная стоимость закрытых заказов");
            Console.WriteLine("5. Количество закрытых заказов определенного официанта");
            Console.WriteLine("6. Статистика заказанных блюд");
            Console.WriteLine("7. Выход");

            int choice = GetUserChoice();

            switch (choice)
            {
                case 1:
                    ManageDishes();
                    break;
                case 2:
                    ManageOrders();
                    break;
                case 3:
                    PrintMenu();
                    break;
                case 4:
                    Console.WriteLine($"Полная стоимость всех закрытых заказов: {CalculateTotalClosedOrders()}");
                    break;
                case 5:
                    Console.Write("Введите ID официанта: ");
                    int waiterId = int.Parse(Console.ReadLine());
                    PrintWaiterOrdersInfo(waiterId);
                    break;
                case 6:
                    PrintDishOrderStatistics();
                    break;
                case 7:
                    isRunning = false;
                    Console.WriteLine("Выход из приложения...");
                    break;
                default:
                    Console.WriteLine("Неправильный ввод, попробуйте еще раз.");
                    break;
            }

            Console.WriteLine();
        }
    }

    static void ManageDishes()
    {
        bool isDishManagementRunning = true;
        while (isDishManagementRunning)
        {
            Console.WriteLine("Меню выбора действия с блюдами:");
            Console.WriteLine("1. Создать блюдо");
            Console.WriteLine("2. Изменить блюдо");
            Console.WriteLine("3. Удалить блюдо");
            Console.WriteLine("4. Вернуться в главное меню");

            int choice = GetUserChoice();

            switch (choice)
            {
                case 1:
                    CreateDish();
                    break;
                case 2:
                    EditDish();
                    break;
                case 3:
                    DeleteDish();
                    break;
                case 4:
                    isDishManagementRunning = false;
                    break;
                default:
                    Console.WriteLine("Неправильный ввод, попробуйте еще раз.");
                    break;
            }

            Console.WriteLine();
        }
    }

    static void ManageOrders()
    {
        bool isOrderManagementRunning = true;
        while (isOrderManagementRunning)
        {
            Console.WriteLine("Меню выбора действий с заказами:");
            Console.WriteLine("1. Создание заказа");
            Console.WriteLine("2. Изменение заказа");
            Console.WriteLine("3. Закрытие заказа");
            Console.WriteLine("4. Вывод чека");
            Console.WriteLine("5. Вернуться в главное меню.");

            int choice = GetUserChoice();

            switch (choice)
            {
                case 1:
                    CreateOrder();
                    break;
                case 2:
                    EditOrder();
                    break;
                case 3:
                    CloseOrder();
                    break;
                case 4:
                    PrintReceipt();
                    break;
                case 5:
                    isOrderManagementRunning = false;
                    break;
                default:
                    Console.WriteLine("Неправильный ввод, попробуйте еще раз.");
                    break;
            }

            Console.WriteLine();
        }
    }

    static void PrintMenu()
    {
        Console.WriteLine("Меню:");
        var dishByCategory = _dishes.GroupBy(d => d.Category)
                                   .ToDictionary(g => g.Key, g => g.ToList());

        foreach (var kvp in dishByCategory)
        {
            Console.WriteLine($"{kvp.Key}:");
            foreach (var dish in kvp.Value)
            {
                dish.PrintDishInfo();
                Console.WriteLine();
            }
        }
    }

    static double CalculateTotalClosedOrders()
    {
        return _orders.Where(o => o.CloseTime != DateTime.MinValue)
                      .Sum(o => o.TotalCost);
    }

    static void PrintWaiterOrdersInfo(int waiterId)
    {
        var waiterOrders = _orders
            .Where(o => o.CloseTime != DateTime.MinValue && o.WaiterId == waiterId)
            .OrderBy(o => o.Id)
            .ToList();

        if (!waiterOrders.Any())
        {
            Console.WriteLine($"Официант с ID {waiterId} не имеет закрытых заказов.");
            return;
        }

        Console.WriteLine($"Количество закрытых заказов официанта с ID {waiterId}: {waiterOrders.Count}");
        Console.WriteLine("==========================================\n");
    }

    static void PrintDishOrderStatistics()
    {
        if (!_orders.Any(o => o.CloseTime != DateTime.MinValue))
        {
            Console.WriteLine("\nВ системе нет закрытых заказов для формирования статистики.");
            return;
        }

        var dishOrders = CollectDishOrderStatistics();

        Console.WriteLine("\n=== Статистика заказанных блюд ===");
        Console.WriteLine("----------------------------------");

        var groupedStats = dishOrders
            .GroupBy(kvp => kvp.Key.Category)
            .OrderBy(g => g.Key);

        foreach (var categoryGroup in groupedStats)
        {
            Console.WriteLine($"\nКатегория: {categoryGroup.Key}");
            Console.WriteLine("----------------------------------");

            foreach (var dishStat in categoryGroup.OrderByDescending(d => d.Value))
            {
                Console.WriteLine($"{dishStat.Key.Name,-30} | {dishStat.Value,5} заказов | На сумму: {dishStat.Value * dishStat.Key.Price:C}");
            }
        }

        int totalOrders = dishOrders.Sum(x => x.Value);
        double totalRevenue = dishOrders.Sum(x => x.Value * x.Key.Price);

        Console.WriteLine("\n=== Общая статистика ===");
        Console.WriteLine($"Всего заказано блюд: {totalOrders}");
        Console.WriteLine($"Общая сумма: {totalRevenue:C}");
        Console.WriteLine("=======================\n");
    }

    static Dictionary<Dish, int> CollectDishOrderStatistics()
    {
        var dishOrders = new Dictionary<Dish, int>();

        foreach (var order in _orders.Where(o => o.CloseTime != DateTime.MinValue))
        {
            foreach (var dish in order.Dishes)
            {
                if (dishOrders.ContainsKey(dish))
                {
                    dishOrders[dish]++;
                }
                else
                {
                    dishOrders[dish] = 1;
                }
            }
        }
        return dishOrders;
    }

    static void PrintDishCategories()
    {
        Console.WriteLine("Существующие категории блюд:");
        foreach (DishCategory category in Enum.GetValues(typeof(DishCategory)))
        {
            Console.WriteLine($"- {category}");
        }
    }

    static void CreateDish()
    {
        Console.Write("Введите название блюда: ");
        string name = Console.ReadLine();
        Console.Write("Введите состав блюда: ");
        string ingredients = Console.ReadLine();
        Console.Write("Введите вес блюда: ");
        string weight = Console.ReadLine();
        Console.Write("Введите цену блюда: ");
        double price = double.Parse(Console.ReadLine());

        PrintDishCategories();
        Console.Write("Введите категорию блюда: ");
        DishCategory category = (DishCategory)Enum.Parse(typeof(DishCategory), Console.ReadLine());

        Console.Write("Введите время приготовления блюда: ");
        int prepTime = int.Parse(Console.ReadLine());
        Console.Write("Введите типы блюда (через запятую): ");
        string[] types = Console.ReadLine().Split(',');

        var newDish = new Dish();
        int nextId = GetNextAvailableId(_dishes);
        newDish.Id = nextId;
        newDish.CreateDish(name, ingredients, weight, price, category, prepTime, types);
        _dishes.Add(newDish);
        Console.WriteLine($"Блюдо '{name}' успешно создано с ID: {nextId}");
    }

    static void EditDish()
    {
        Console.Write("Введит ID блюда для изменения: ");
        int id = int.Parse(Console.ReadLine());
        var dish = _dishes.Find(d => d.Id == id);
        if (dish == null)
        {
            Console.WriteLine($"Блюдо с ID '{id}' не найдено.");
            return;
        }

        if (IsDishUsedInOpenOrders(id))
        {
            Console.WriteLine($"Невозможно изменить блюдо '{dish.Name}'. Оно используется в открытых заказах.");
            return;
        }

        Console.Write("Введите новое название блюда: ");
        string name = Console.ReadLine();
        Console.Write("Введите новые ингридиенты для блюда: ");
        string ingredients = Console.ReadLine();
        Console.Write("Введите новый вес блюда: ");
        string weight = Console.ReadLine();
        Console.Write("Введите новую цену блюда: ");
        double price = double.Parse(Console.ReadLine());

        PrintDishCategories();
        Console.Write("Введите новую категорию блюда: ");
        DishCategory category = (DishCategory)Enum.Parse(typeof(DishCategory), Console.ReadLine());

        Console.Write("Введите новое время готовки блюда: ");
        int prepTime = int.Parse(Console.ReadLine());
        Console.Write("Введите новые типы блюда (через запятую): ");
        string[] types = Console.ReadLine().Split(',');

        dish.EditDish(name, ingredients, weight, price, category, prepTime, types);
        Console.WriteLine($"Блюдо '{dish.Name}' успешно обновлено.");
    }

    static void DeleteDish()
    {
        Console.Write("Введите ID блюда для удаления: ");
        int id = int.Parse(Console.ReadLine());
        var dish = _dishes.Find(d => d.Id == id);
        if (dish == null)
        {
            Console.WriteLine($"Блюда с ID '{id}' не найдено.");
            return;
        }

        if (IsDishUsedInOpenOrders(id))
        {
            Console.WriteLine($"Невозможно удалить блюдо '{dish.Name}'. Оно используется в открытых заказах.");
            return;
        }

        _dishes.Remove(dish);
        Console.WriteLine($"Блюдо'{dish.Name}' успешно удалено.");
    }


    static void CreateOrder()
    {
        Console.Write("Введите номер стола: ");
        int tableId = int.Parse(Console.ReadLine());
        Console.Write("Введите количество блюд в заказе: ");
        int numDishes = int.Parse(Console.ReadLine());
        List<Dish> dishes = new List<Dish>();
        for (int i = 0; i < numDishes; i++)
        {
            Console.Write($"Введите {i + 1} ID блюда: ");
            int dishId = int.Parse(Console.ReadLine());
            var dish = _dishes.Find(d => d.Id == dishId);
            if (dish != null)
            {
                dishes.Add(dish);
            }
            else
            {
                Console.WriteLine($"Блюда с ID '{dishId}' не найдено.");
            }
        }
        Console.Write("Введите комментарий к заказу: ");
        string comment = Console.ReadLine();
        Console.Write("Введите ID официанта: ");
        int waiterId = int.Parse(Console.ReadLine());

        var newOrder = new Order();
        int nextId = GetNextAvailableOrderId(_orders);
        newOrder.Id = nextId;
        newOrder.CreateOrder(in tableId, dishes, comment, DateTime.Now, in waiterId);
        _orders.Add(newOrder);
        Console.WriteLine($"Заказ с ID {nextId} создан успешно");
    }

    static void EditOrder()
    {
        Console.Write("Введите ID заказа для редактирования: ");
        int id = int.Parse(Console.ReadLine());
        var order = _orders.Find(o => o.Id == id);
        if (order == null)
        {
            Console.WriteLine($"Заказа с ID '{id}' не найдено.");
            return;
        }

        if (order.CloseTime != DateTime.MinValue)
        {
            Console.WriteLine($"Невозможно отредактирвать заказ с ID {id} так как он уже закрыт.");
            return;
        }

        Console.Write("Введите новые блюда (через запятую): ");
        string[] dishIds = Console.ReadLine().Split(',');
        List<Dish> newDishes = new List<Dish>();
        foreach (var dishId in dishIds)
        {
            var dish = _dishes.Find(d => d.Id == int.Parse(dishId));
            if (dish != null)
            {
                newDishes.Add(dish);
            }
            else
            {
                Console.WriteLine($"Блюда с ID '{dishId}' не найдено.");
            }
        }
        Console.Write("Введите новый комментарий к заказу: ");
        string newComment = Console.ReadLine();

        order.EditOrder(ref newDishes, newComment);
        Console.WriteLine($"Заказ {id} успешно обновлен.");
    }

    static void CloseOrder()
    {
        Console.Write("Введите ID заказа для закрытия: ");
        int id = int.Parse(Console.ReadLine());
        var order = _orders.Find(o => o.Id == id);
        if (order == null)
        {
            Console.WriteLine($"Заказа с ID '{id}' не найдено.");
            return;
        }

        if (order.CloseTime != DateTime.MinValue)
        {
            Console.WriteLine($"Заказ с ID {id} уже был закрыт в {order.CloseTime}.");
            return;
        }

        double finalCost;
        order.CloseOrder(out finalCost);
        Console.WriteLine($"Заказ {id} успешно закрыт. Финальная стоимость: {finalCost:C}");
    }

    static void PrintReceipt()
    {
        Console.Write("Введите ID заказа для печати чека: ");
        int id = int.Parse(Console.ReadLine());
        var order = _orders.Find(o => o.Id == id);
        if (order == null)
        {
            Console.WriteLine($"Заказа с ID '{id}' не найдено.");
            return;
        }

        if (order.CloseTime == DateTime.MinValue)
        {
            Console.WriteLine($"Невозможно вывести чек для заказа с ID {id}. Заказ еще не закрыт.");
            return;
        }

        order.PrintReceipt();
    }

    static int GetUserChoice()
    {
        Console.WriteLine();
        Console.Write("Введите свой выбор: ");
        Console.WriteLine();
        return int.Parse(Console.ReadLine());

    }

    private static int GetNextAvailableId(List<Dish> dishes)
    {
        if (!dishes.Any()) return 1;

        var sortedIds = dishes.Select(d => d.Id).OrderBy(id => id).ToList();

        for (int i = 0; i < sortedIds.Count; i++)
        {
            if (sortedIds[i] != i + 1)
            {
                return i + 1;
            }
        }

        return sortedIds.Count + 1;
    }

    private static int GetNextAvailableOrderId(List<Order> orders)
    {
        if (!orders.Any()) return 1;

        var sortedIds = orders.Select(o => o.Id).OrderBy(id => id).ToList();

        for (int i = 0; i < sortedIds.Count; i++)
        {
            if (sortedIds[i] != i + 1)
            {
                return i + 1;
            }
        }

        return sortedIds.Count + 1;
    }

    static bool IsDishUsedInOpenOrders(int dishId)
    {
        return _orders.Any(o =>
            o.CloseTime == DateTime.MinValue &&
            o.Dishes.Any(d => d.Id == dishId)
        );
    }



}