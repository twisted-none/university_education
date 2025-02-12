using System;

Console.Write("Введите m: ");
int m = int.Parse(Console.ReadLine());
Console.Write("Введите n: ");
int n = int.Parse(Console.ReadLine());

Console.WriteLine($"A(m,n)={Ackermann(m, n)}");


 int Ackermann(int m, int n)
{
    if (m == 0)
        return n + 1;
    else if (n == 0)
        return Ackermann(m - 1, 1);
    else
        return Ackermann(m - 1, Ackermann(m, n - 1));
}