using System;

Console.Write("Введите число: ");
int n = int.Parse(Console.ReadLine());
Console.WriteLine(ReverseNumber(n, 0));

int ReverseNumber(int n, int reversed)
{
    if (n == 0)
        return reversed;

    return ReverseNumber(n / 10, reversed * 10 + n % 10);
}
