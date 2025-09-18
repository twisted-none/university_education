using System;

class ImprovedCalculator
{
    static double memory = 0;

    static void Main()
    {
        while (true)
        {
            Console.WriteLine("\nКалькулятор");
            Console.WriteLine("1. Сложение (+)");
            Console.WriteLine("2. Вычитание (-)");
            Console.WriteLine("3. Умножение (*)");
            Console.WriteLine("4. Деление (/)");
            Console.WriteLine("5. Процент (%)");
            Console.WriteLine("6. Обратное число (1/x)");
            Console.WriteLine("7. Квадрат числа (x^2)");
            Console.WriteLine("8. Квадратный корень (√x)");
            Console.WriteLine("9. Добавить в память (M+)");
            Console.WriteLine("10. Вычесть из памяти (M-)");
            Console.WriteLine("11. Вызвать из памяти (MR)");
            Console.WriteLine("0. Выход");

            Console.Write("Выберите операцию: ");
            string choice = Console.ReadLine();

            if (choice == "0") break;

            double result = 0;
            double num1 = 0, num2 = 0;

            switch (choice)
            {
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                    Console.Write("Введите первое число: ");
                    num1 = Convert.ToDouble(Console.ReadLine());
                    Console.Write("Введите второе число: ");
                    num2 = Convert.ToDouble(Console.ReadLine());
                    break;
                case "6":
                case "7":
                case "8":
                    Console.Write("Введите число: ");
                    num1 = Convert.ToDouble(Console.ReadLine());
                    break;
                case "9":
                case "10":
                    Console.Write("Введите число: ");
                    num1 = Convert.ToDouble(Console.ReadLine());
                    break;
                case "11":
                    Console.WriteLine($"Значение в памяти: {memory}");
                    continue;
                default:
                    Console.WriteLine("Неверный выбор. Попробуйте снова.");
                    continue;
            }

            switch (choice)
            {
                case "1": result = num1 + num2; break;
                case "2": result = num1 - num2; break;
                case "3": result = num1 * num2; break;
                case "4":
                    if (num2 != 0) result = num1 / num2;
                    else { Console.WriteLine("Ошибка: деление на ноль!"); continue; }
                    break;
                case "5":
                    if (num2 != 0) result = (num1 / num2) * 100;
                    else result = 0;
                    break;
                case "6":
                    if (num1 != 0) result = 1 / num1;
                    else { Console.WriteLine("Ошибка: деление на ноль!"); continue; }
                    break;
                case "7": result = num1 * num1; break;
                case "8":
                    if (num1 >= 0) result = Math.Sqrt(num1);
                    else { Console.WriteLine("Ошибка: отрицательное число под корнем!"); continue; }
                    break;
                case "9": memory += num1; Console.WriteLine($"Добавлено в память. Новое значение: {memory}"); continue;
                case "10": memory -= num1; Console.WriteLine($"Вычтено из памяти. Новое значение: {memory}"); continue;
            }

            Console.WriteLine($"Результат: {result}");
        }
    }
}