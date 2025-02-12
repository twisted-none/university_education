using System;

int total_amount = 0;
int total_americano = 0;
int total_latte = 0;


Console.Write("Введите количество воды в мл: ");
int total_water = int.Parse(Console.ReadLine());

Console.Write("Введите количество молока в мл: ");
int total_milk = int.Parse(Console.ReadLine());


while ((total_water >= 30 & total_milk >= 270) || (total_water >= 300))
{
    Console.Write("Выберите напиток (1 - американо, 2 - латте): ");
    int user_choice = int.Parse(Console.ReadLine());

    switch (user_choice)
    {
        case 1:
            if (total_water >= 300)
            {
                total_amount += 150;
                total_water -= 300;
                total_americano += 1;
                Console.WriteLine("Ваш напиток готов");
            }
            else
            {
                Console.WriteLine("Не хватает воды");
            }

            continue;
        
        case 2:
            if (total_water >= 30 & total_milk >= 270)
            {
                total_amount += 170;
                total_water -= 30;
                total_milk -= 270;
                total_latte += 1;
                Console.WriteLine("Ваш напиток готов");
            }
            else
            {
                Console.WriteLine("Не хватает молока");
            }

            continue;
        
        default:
            Console.WriteLine("Неправильный выбор, попробуйте снова.");

            continue;
    }

}

Console.WriteLine("*Отчёт*");
Console.WriteLine("Ингридиентов осталось:");
Console.WriteLine($"    Вода: {total_water} мл");
Console.WriteLine($"    Молоко: {total_milk} мл");
Console.WriteLine($"Кружек американо приготовлено: {total_americano}");
Console.WriteLine($"Кружек латте приготовлено: {total_latte}");
Console.WriteLine($"Итого: {total_amount} рублей.");