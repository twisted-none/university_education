using System;

while (true)
{
    Console.Write("Введите числитель: ");
    int numerator = int.Parse(Console.ReadLine());

    Console.Write("Введите знаменатель: ");
    int denominator = int.Parse(Console.ReadLine());

    if (denominator == 0)
    {
        Console.WriteLine("Ошибка! Знаменатель не может быть равен 0.");
        continue;
    }

    for (int i = Math.Max(Math.Abs(numerator), Math.Abs(denominator)); i > 1; i--)

    {
        if (numerator % i == 0 && denominator % i == 0)
        {
            numerator /= i;
            denominator /= i;
        }


    }

    if ((numerator > 0 & denominator > 0) || (numerator < 0 & denominator < 0))
    {
        Console.WriteLine($"Результат: {Math.Abs(numerator)} / {Math.Abs(denominator)}");
    }

    else
    {
        Console.WriteLine($"Результат: - {Math.Abs(numerator)} / {Math.Abs(denominator)}");
    }
}
