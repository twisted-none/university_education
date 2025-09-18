using System;
using System.Collections.Generic;

public enum DishCategory
{
    Drinks,
    Salads,
    ColdAppetizers,
    HotAppetizers,
    Soups,
    MainDishes,
    Desserts
}

public class Dish
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Ingredients { get; set; }
    public string Weight { get; set; }
    public double Price { get; set; }
    public DishCategory Category { get; set; }
    public int PrepTime { get; set; }
    public string[] Type { get; set; }

    public void CreateDish(string name, string ingredients, string weight, double price,
    DishCategory category, int prepTime, params string[] type)
    {
        Name = name;
        Ingredients = ingredients;
        Weight = weight;
        Price = price;
        Category = category;
        PrepTime = prepTime;
        Type = type;
    }

    public void EditDish(string name, string ingredients, string weight, double price,
    DishCategory category, int prepTime, params string[] type)
    {
        Name = name;
        Ingredients = ingredients;
        Weight = weight;
        Price = price;
        Category = category;
        PrepTime = prepTime;
        Type = type;
    }

    public void PrintDishInfo()
    {
        Console.WriteLine($"Название: {Name}");
        Console.WriteLine($"Состав: {Ingredients}");
        Console.WriteLine($"Вес: {Weight}");
        Console.WriteLine($"Цена: {Price}");
        Console.WriteLine($"Категория: {Category}");
        Console.WriteLine($"Время приготовления: {PrepTime} минут");
        Console.WriteLine("Тип: ");
        foreach (var dishType in Type)
        {
            Console.WriteLine($"- {dishType}");
        }
    }

    public void DeleteDish(List<Dish> dishes)
    {
        var dish = dishes.Find(d => d.Id == Id);
        if (dish != null)
        {
            dishes.Remove(dish);
            Console.WriteLine($"Блюдо '{Name}' было удалено.");
        }
        else
        {
            Console.WriteLine($"Блюдо с ID '{Id}' не найдено.");
        }
    }
}