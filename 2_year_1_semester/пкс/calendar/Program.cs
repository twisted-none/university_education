using System;

class Program
{
    static void Main()
    {
        Console.Write("Введите номер дня недели, с которого начинается май (1 - понедельник, 7 - воскресенье): ");
        int startDay = int.Parse(Console.ReadLine());

        if (startDay < 1 || startDay > 7)
        {
            Console.WriteLine("Некорректный ввод. Введите число от 1 до 7.");
            return;
        }

        while (true)
        {
            Console.Write("Введите номер дня месяца (1-31) или 0 для выхода: ");
            int day = int.Parse(Console.ReadLine());

            if (day == 0) break;
            if (day < 1 || day > 31)
            {
                Console.WriteLine("Некорректный ввод. Введите число от 1 до 31.");
                continue;
            }

            int dayOfWeek = (startDay + day - 2) % 7 + 1;
            bool isWeekend = (dayOfWeek == 6 || dayOfWeek == 7);
            bool isHoliday = (day >= 1 && day <= 5) || (day >= 8 && day <= 10);

            if (isWeekend || isHoliday)
            {
                Console.WriteLine($"{day} мая - выходной день");
            }
            else
            {
                Console.WriteLine($"{day} мая - рабочий день");
            }
        }
    }
}