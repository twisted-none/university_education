using System;

class Program
{
    static ReservationSystem reservationSystem;

    static void Main(string[] args)
    {
        // Инициализация системы
        reservationSystem = new ReservationSystem();

        // Добавляем несколько столов для демонстрации
        InitializeSampleTables();

        while (true)
        {
            ShowMenu();
            string? choice = Console.ReadLine();

            switch (choice)
            {
                case "1":
                    AddNewTable();
                    break;
                case "2":
                    CreateNewBooking();
                    break;
                case "3":
                    ShowTableInfo();
                    break;
                case "4":
                    ShowAvailableTables();
                    break;
                case "5":
                    ShowAllBookings();
                    break;
                case "6":
                    FindBookingByPhoneAndName();
                    break;
                case "7":
                    EditTableInfo();
                    break;
                case "0":
                    return;
                default:
                    Console.WriteLine("Неверный выбор. Попробуйте снова.");
                    break;
            }

            Console.WriteLine("\nНажмите любую клавишу для продолжения...");
            Console.ReadKey();
            Console.Clear();
        }
    }

    static void ShowMenu()
    {
        Console.WriteLine("=== Система бронирования столов ===");
        Console.WriteLine("1. Добавить новый стол");
        Console.WriteLine("2. Создать новое бронирование");
        Console.WriteLine("3. Показать информацию о столе");
        Console.WriteLine("4. Показать доступные столы");
        Console.WriteLine("5. Показать все бронирования");
        Console.WriteLine("6. Найти бронирование по телефону и имени");
        Console.WriteLine("7. Редактировать информацию о столе");
        Console.WriteLine("0. Выход");
        Console.Write("\nВыберите действие: ");
    }

    static void InitializeSampleTables()
    {
        reservationSystem.AddTable("у окна", 4);
        reservationSystem.AddTable("у прохода", 2);
        reservationSystem.AddTable("в глубине", 6);
        Console.WriteLine("Демонстрационные столы добавлены в систему.");
    }

    static void EditTableInfo()
    {
        try
        {
            Console.Write("Введите ID стола для редактирования: ");
            if (!int.TryParse(Console.ReadLine(), out int tableId))
            {
                Console.WriteLine("Ошибка: некорректный ID стола.");
                return;
            }

            // Сначала показываем текущую информацию о столе
            Console.WriteLine("\nТекущая информация о столе:");
            reservationSystem.PrintTableInfo(tableId);

            Console.Write("\nВведите новое расположение стола: ");
            string? newLocation = Console.ReadLine();

            Console.Write("Введите новое количество мест: ");
            if (!int.TryParse(Console.ReadLine(), out int newSeatsCount))
            {
                Console.WriteLine("Ошибка: некорректное количество мест.");
                return;
            }

            reservationSystem.UpdateTableInfo(tableId, newLocation ?? "не указано", newSeatsCount);
            Console.WriteLine("Информация о столе успешно обновлена!");

            // Показываем обновленную информацию
            Console.WriteLine("\nОбновленная информация о столе:");
            reservationSystem.PrintTableInfo(tableId);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка при редактировании информации о столе: {ex.Message}");
        }
    }

    static void AddNewTable()
    {
        Console.Write("Введите расположение стола: ");
        string? location = Console.ReadLine();

        Console.Write("Введите количество мест: ");
        if (int.TryParse(Console.ReadLine(), out int seatsCount))
        {
            reservationSystem.AddTable(location ?? "не указано", seatsCount);
            Console.WriteLine("Стол успешно добавлен.");
        }
        else
        {
            Console.WriteLine("Ошибка: некорректное количество мест.");
        }
    }

    static void CreateNewBooking()
    {
        try
        {
            Console.Write("ID клиента: ");
            int clientId = int.Parse(Console.ReadLine() ?? "0");

            Console.Write("Имя клиента: ");
            string? clientName = Console.ReadLine();

            Console.Write("Номер телефона: ");
            string? phoneNumber = Console.ReadLine();

            Console.Write("Время начала (формат ЧЧ:00): ");
            string? startTime = Console.ReadLine();

            Console.Write("Время окончания (формат ЧЧ:00): ");
            string? endTime = Console.ReadLine();

            Console.Write("Комментарий: ");
            string? comment = Console.ReadLine();

            Console.Write("ID стола: ");
            int tableId = int.Parse(Console.ReadLine() ?? "0");

            var booking = reservationSystem.CreateBooking(
                clientId,
                clientName ?? "не указано",
                phoneNumber ?? "не указано",
                startTime ?? "00:00",
                endTime ?? "00:00",
                comment ?? "",
                tableId
            );

            Console.WriteLine("Бронирование успешно создано!");
            booking.PrintBookingInfo();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка при создании бронирования: {ex.Message}");
        }
    }

    static void ShowTableInfo()
    {
        Console.Write("Введите ID стола: ");
        if (int.TryParse(Console.ReadLine(), out int tableId))
        {
            reservationSystem.PrintTableInfo(tableId);
        }
        else
        {
            Console.WriteLine("Ошибка: некорректный ID стола.");
        }
    }

    static void ShowAvailableTables()
    {
        Console.Write("Время начала (формат ЧЧ:00): ");
        string? startTime = Console.ReadLine();

        Console.Write("Время окончания (формат ЧЧ:00): ");
        string? endTime = Console.ReadLine();

        Console.Write("Минимальное количество мест (Enter для пропуска): ");
        int? seats = string.IsNullOrEmpty(Console.ReadLine()) ? null : int.Parse(Console.ReadLine() ?? "0");

        Console.Write("Расположение (Enter для пропуска): ");
        string? location = Console.ReadLine();

        var availableTables = reservationSystem.FindAvailableTables(
            startTime ?? "00:00",
            endTime ?? "00:00",
            seats,
            location
        );

        if (availableTables.Any())
        {
            Console.WriteLine("\nДоступные столы:");
            foreach (var table in availableTables)
            {
                table.PrintTableInfo();
                Console.WriteLine();
            }
        }
        else
        {
            Console.WriteLine("Нет доступных столов с указанными параметрами.");
        }
    }

    static void ShowAllBookings()
    {
        reservationSystem.PrintAllBookings();
    }

    static void FindBookingByPhoneAndName()
    {
        Console.Write("Введите последние 4 цифры номера телефона: ");
        string? lastFourDigits = Console.ReadLine();

        Console.Write("Введите имя клиента: ");
        string? clientName = Console.ReadLine();

        var bookings = reservationSystem.FindBookings(
            lastFourDigits ?? "",
            clientName ?? ""
        );

        if (bookings.Any())
        {
            Console.WriteLine("\nНайденные бронирования:");
            foreach (var booking in bookings)
            {
                booking.PrintBookingInfo();
                Console.WriteLine();
            }
        }
        else
        {
            Console.WriteLine("Бронирования не найдены.");
        }
    }
}