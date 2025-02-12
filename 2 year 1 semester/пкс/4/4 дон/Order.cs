using System;
using System.Collections.Generic;

public class Order
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public List<Dish> Dishes { get; set; }
    public string Comment { get; set; }
    public DateTime OrderTime { get; set; }
    public int WaiterId { get; set; }
    public DateTime CloseTime { get; set; }
    public double TotalCost { get; set; }

    public void CreateOrder(in int tableId, List<Dish> dishes, string comment, DateTime orderTime, in int waiterId)
    {
        TableId = tableId;
        Dishes = dishes;
        Comment = comment;
        OrderTime = orderTime;
        WaiterId = waiterId;
    }

    public void EditOrder(ref List<Dish> dishes, string comment)
    {
        Dishes = dishes;
        Comment = comment;
    }

    public void PrintOrderInfo()
    {
        Console.WriteLine($"Номер заказа: {Id}");
        Console.WriteLine($"Номер стола: {TableId}");
        Console.WriteLine("Заказанные блюда:");
        foreach (var dish in Dishes)
        {
            Console.WriteLine($"- {dish.Name} x {dish.Price}");
        }
        Console.WriteLine($"Комментарий: {Comment}");
        Console.WriteLine($"Время заказа: {OrderTime}");
        Console.WriteLine($"Номер официанта: {WaiterId}");
        Console.WriteLine($"Время закрытия заказа: {CloseTime}");
        Console.WriteLine($"Полная стоимость: {TotalCost}");
    }

    public void CloseOrder(out double finalCost)
    {
        CloseTime = DateTime.Now;
        CalculateTotalCost();
        finalCost = TotalCost;
    }

    public void PrintReceipt()
    {
        Console.WriteLine("==========================================");
        Console.WriteLine($"Стол: {TableId}".PadRight(20) + $"Официант: {WaiterId}".PadLeft(30));
        Console.WriteLine($"Период: {OrderTime:yyyy-MM-dd HH:mm} - {CloseTime:yyyy-MM-dd HH:mm}");
        Console.WriteLine("==========================================");
        Console.WriteLine();

        var groupedDishes = Dishes
            .GroupBy(d => d.Category)
            .ToDictionary(
                g => g.Key,
                g => g.GroupBy(d => d.Name)
                     .Select(dg => new {
                         Dish = dg.First(),
                         Count = dg.Count(),
                         SubTotal = dg.Count() * dg.First().Price
                     })
                     .ToList()
            );

        foreach (var category in groupedDishes)
        {
            Console.WriteLine($"{category.Key}:");
            Console.WriteLine("------------------------------------------");

            double categoryTotal = 0;

            foreach (var dishGroup in category.Value)
            {

                string dishInfo = $"{dishGroup.Dish.Name}";
                string priceInfo = $"{dishGroup.Count} x {dishGroup.Dish.Price:F2} = {dishGroup.SubTotal:F2}";

                Console.WriteLine($"    {dishInfo.PadRight(40)} {priceInfo.PadLeft(20)}");

                categoryTotal += dishGroup.SubTotal;
            }

            Console.WriteLine("------------------------------------------");
            Console.WriteLine($"{"Подитог категории:".PadRight(40)} {categoryTotal:F2}".PadLeft(60));
            Console.WriteLine();
        }

        Console.WriteLine("==========================================");
        Console.WriteLine($"{"ИТОГО:".PadRight(40)} {TotalCost:F2}".PadLeft(60));
        Console.WriteLine("==========================================");
    }

    private void CalculateTotalCost()
    {
        TotalCost = Dishes.Sum(d => d.Price);
    }
}