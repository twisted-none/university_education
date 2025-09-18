public class Table
{
    // Хранимая информация
    public int Id { get; private set; }
    public string Location { get; private set; }
    public int SeatsCount { get; private set; }
    public Dictionary<string, Booking?> Schedule { get; private set; }

    // Конструктор для создания стола
    public Table(int id, string location, int seatsCount)
    {
        Id = id;
        Location = location;
        SeatsCount = seatsCount;
        Schedule = InitializeSchedule();
    }

    // Инициализация расписания с часовыми интервалами
    private Dictionary<string, Booking?> InitializeSchedule()
    {
        var schedule = new Dictionary<string, Booking?>();
        for (int hour = 9; hour < 18; hour++)
        {
            string timeSlot = $"{hour:D2}:00-{(hour + 1):D2}:00";
            schedule[timeSlot] = null;
        }
        return schedule;
    }

    // Метод для изменения информации стола
    public void UpdateTableInfo(string newLocation, int newSeatsCount)
    {
        // Проверяем, нет ли активных бронирований
        if (Schedule.Any(s => s.Value != null))
        {
            throw new InvalidOperationException("Невозможно изменить информацию о столе с активными бронированиями");
        }

        Location = newLocation;
        SeatsCount = newSeatsCount;
    }

    // Метод для вывода информации о столе
    public void PrintTableInfo()
    {
        Console.WriteLine($"ID: {new string('-', 50)}{Id}");
        Console.WriteLine($"Расположение: {new string('-', 45)}\"{Location}\"");
        Console.WriteLine($"Количество мест: {new string('-', 42)}{SeatsCount}");
        Console.WriteLine("Расписание:");

        foreach (var timeSlot in Schedule)
        {
            string bookingInfo = timeSlot.Value == null
                ? new string('-', 50)
                : $"{new string('-', 15)}ID {timeSlot.Value.ClientId}, {timeSlot.Value.ClientName}, {timeSlot.Value.PhoneNumber}";

            Console.WriteLine($"{timeSlot.Key} {bookingInfo}");
        }
    }

    // Метод для проверки доступности стола в указанное время
    public bool IsAvailable(string startTime, string endTime)
    {
        var timeSlots = GetTimeSlotsBetween(startTime, endTime);
        return timeSlots.All(slot => Schedule.ContainsKey(slot) && Schedule[slot] == null);
    }

    // Вспомогательный метод для получения временных слотов между началом и концом брони
    public List<string> GetTimeSlotsBetween(string startTime, string endTime)
    {
        var slots = new List<string>();
        int startHour = int.Parse(startTime.Split(':')[0]);
        int endHour = int.Parse(endTime.Split(':')[0]);

        for (int hour = startHour; hour < endHour; hour++)
        {
            string timeSlot = $"{hour:D2}:00-{(hour + 1):D2}:00";
            slots.Add(timeSlot);
        }

        return slots;
    }

    // Метод для установки брони в расписании
    public void SetBooking(Booking booking, string startTime, string endTime)
    {
        var timeSlots = GetTimeSlotsBetween(startTime, endTime);
        foreach (var slot in timeSlots)
        {
            Schedule[slot] = booking;
        }
    }

    // Метод для очистки брони в расписании
    public void ClearBooking(string startTime, string endTime)
    {
        var timeSlots = GetTimeSlotsBetween(startTime, endTime);
        foreach (var slot in timeSlots)
        {
            Schedule[slot] = null;
        }
    }
}