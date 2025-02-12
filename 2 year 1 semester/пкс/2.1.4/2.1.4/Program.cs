using System;

Console.WriteLine("Загадайте число от 0 до 63.");
Console.WriteLine("Отвечайте '1' для 'да' и '0' для 'нет'.");

int min = 0;
int max = 63;
int guessCount = 0;

while (min <= max)
{
    int guess = (min + max) / 2;
    guessCount++;

    Console.Write($"Вопрос {guessCount}: Ваше число больше {guess}? ");
    string answer = Console.ReadLine();

    if (answer == "1")
    {
        min = guess + 1;
    }
    else if (answer == "0")
    {
        if (min == max)
        {
            Console.WriteLine($"Ваше число - {guess}!");
            break;
        }
        max = guess;
    }
    else
    {
        Console.WriteLine("Пожалуйста, введите '1' для 'да' или '0' для 'нет'.");
        guessCount--;
    }
}