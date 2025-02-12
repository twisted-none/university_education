public class ReservationSystem
{
    private List<Table> Tables { get; set; }
    private List<Booking> Bookings { get; set; }

    public ReservationSystem()
    {
        Tables = new List<Table>();
        Bookings = new List<Booking>();
    }

    // Метод для добавления нового стола
    public void AddTable(string location, int seatsCount)
    {
        int newId = Tables.Count + 1;
        Tables.Add(new Table(newId, location, seatsCount));
    }

    // Новый метод для обновления информации о столе
    public void UpdateTableInfo(int tableId, string newLocation, int newSeatsCount)
    {
        var table = Tables.FirstOrDefault(t => t.Id == tableId);
        if (table == null)
        {
            throw new ArgumentException($"Стол с ID {tableId} не найден");
        }

        table.UpdateTableInfo(newLocation, newSeatsCount);
    }

    // Метод для создания новой брони
    public Booking CreateBooking(int clientId, string clientName, string phoneNumber,
                               string startTime, string endTime, string comment, int tableId)
    {
        var table = Tables.FirstOrDefault(t => t.Id == tableId);
        if (table == null)
        {
            throw new ArgumentException("Стол с указанным ID не найден");
        }

        var booking = new Booking(clientId, clientName, phoneNumber, startTime, endTime, comment, table);
        Bookings.Add(booking);
        return booking;
    }

    // Метод для поиска доступных столов по фильтру 
    public List<Table> FindAvailableTables(string startTime, string endTime,
                                         int? requiredSeats = null, string? location = null)
    {
        return Tables.Where(table =>
            table.IsAvailable(startTime, endTime) &&
            (!requiredSeats.HasValue || table.SeatsCount >= requiredSeats.Value) &&
            (string.IsNullOrEmpty(location) || table.Location.Equals(location, StringComparison.OrdinalIgnoreCase))
        ).ToList();
    }

    // Метод для вывода информации о столе по ID
    public void PrintTableInfo(int tableId)
    {
        var table = Tables.FirstOrDefault(t => t.Id == tableId);
        if (table == null)
        {
            Console.WriteLine($"Стол с ID {tableId} не найден");
            return;
        }
        table.PrintTableInfo();
    }

    // Метод для вывода всех бронирований
    public void PrintAllBookings()
    {
        if (!Bookings.Any())
        {
            Console.WriteLine("Нет активных бронирований");
            return;
        }

        foreach (var booking in Bookings)
        {
            booking.PrintBookingInfo();
            Console.WriteLine();
        }
    }

    // Метод для поиска бронирования по последним 4 цифрам телефона и имени
    public List<Booking> FindBookings(string lastFourDigits, string clientName)
    {
        return Bookings.Where(b =>
            b.PhoneNumber.EndsWith(lastFourDigits) &&
            b.ClientName.Equals(clientName, StringComparison.OrdinalIgnoreCase)
        ).ToList();
    }
}