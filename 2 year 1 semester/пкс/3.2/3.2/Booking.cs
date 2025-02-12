public class Booking
{
    // Хранимая информация
    public int ClientId { get; private set; }
    public string ClientName { get; private set; }
    public string PhoneNumber { get; private set; }
    public string StartTime { get; private set; }
    public string EndTime { get; private set; }
    public string Comment { get; private set; }
    public Table AssignedTable { get; private set; }

    // Конструктор для создания брони
    public Booking(int clientId, string clientName, string phoneNumber,
                  string startTime, string endTime, string comment, Table table)
    {
        // Проверяем доступность стола
        if (!table.IsAvailable(startTime, endTime))
        {
            throw new InvalidOperationException("Стол недоступен в указанное время");
        }

        ClientId = clientId;
        ClientName = clientName;
        PhoneNumber = phoneNumber;
        StartTime = startTime;
        EndTime = endTime;
        Comment = comment;
        AssignedTable = table;

        // Обновляем расписание стола
        table.SetBooking(this, startTime, endTime);
    }

    // Метод для изменения брони
    public void ModifyBooking(string newStartTime, string newEndTime, string newComment)
    {
        // Проверяем доступность стола в новое время
        // Исключаем текущую бронь из проверки
        AssignedTable.ClearBooking(StartTime, EndTime);

        if (!AssignedTable.IsAvailable(newStartTime, newEndTime))
        {
            // Восстанавливаем старую бронь
            AssignedTable.SetBooking(this, StartTime, EndTime);
            throw new InvalidOperationException("Стол недоступен в указанное новое время");
        }

        // Обновляем информацию о брони
        StartTime = newStartTime;
        EndTime = newEndTime;
        Comment = newComment;

        // Обновляем расписание стола
        AssignedTable.SetBooking(this, newStartTime, newEndTime);
    }

    // Метод для отмены брони
    public void CancelBooking()
    {
        AssignedTable.ClearBooking(StartTime, EndTime);
    }

    // Метод для вывода информации о брони
    public void PrintBookingInfo()
    {
        Console.WriteLine($"Информация о бронировании:");
        Console.WriteLine($"ID клиента: {ClientId}");
        Console.WriteLine($"Имя клиента: {ClientName}");
        Console.WriteLine($"Телефон: {PhoneNumber}");
        Console.WriteLine($"Время: {StartTime} - {EndTime}");
        Console.WriteLine($"Комментарий: {Comment}");
        Console.WriteLine($"Стол №{AssignedTable.Id}");
    }
}