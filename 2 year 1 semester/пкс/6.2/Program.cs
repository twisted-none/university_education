using System;
using System.Linq;

class FilterProgram
{
    static void Main()
    {
        string[] strings = { "appleee", "banana", "kiw", "cherry", "orangeee" };

        while (true)
        {
            Console.WriteLine("Выберите способ фильтрации:\n1. Длина больше заданного числа\n2. Начинается с буквы\n3. Содержит заданное количество гласных или больше");
            int choice = int.Parse(Console.ReadLine());

            int minLength = 0;
            string startLetter = "";
            int minVowels = 0;

            switch (choice)
            {
                case 1:
                    minLength = ReadInt("Введите минимальную длину: ");
                    break;
                case 2:
                    startLetter = ReadString("Введите начальную букву: ");
                    break;
                case 3:
                    minVowels = ReadInt("Введите минимальное количество гласных: ");
                    break;
                default:
                    throw new ArgumentException("Неверный выбор");
            }

            var filtered = choice switch
            {
                1 => strings.Where(s => s.Length > minLength).ToArray(),
                2 => strings.Where(s => s.StartsWith(startLetter)).ToArray(),
                3 => strings.Where(s => s.Count(c => "aeiou".Contains(char.ToLower(c))) >= minVowels).ToArray(),
                _ => Array.Empty<string>()
            };

            Console.WriteLine("Отфильтрованные строки: " + string.Join(", ", filtered));
        }
    }

    static int ReadInt(string message) => int.Parse(ReadString(message));

    static string ReadString(string message)
    {
        Console.Write(message);
        return Console.ReadLine();
    }
}