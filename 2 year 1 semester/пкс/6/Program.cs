using System;
using System.Linq;

class Program
{
    delegate string[] SortDelegate(string[] arr);

    static void Main()
    {
        string[] strings = { "appleee", "banana", "kiw", "cherry", "orangeee" };

        while (true)
        {
            Console.WriteLine("Выберите способ сортировки:\n1. По длине строки\n2. По алфавиту\n3. По количеству гласных букв");

            int choice = int.Parse(Console.ReadLine());

            SortDelegate sorter = choice switch
            {
                1 => arr => arr.OrderBy(s => s.Length).ToArray(),
                2 => arr => arr.OrderBy(s => s).ToArray(),
                3 => arr => arr.OrderBy(s => s.Count(c => "aeiouy".Contains(char.ToLower(c)))).ToArray(),
                _ => throw new ArgumentException("Неверный выбор")
            };

            strings = sorter(strings);
            Console.WriteLine("Отсортированный массив: " + string.Join(", ", strings));
        }
    }
}