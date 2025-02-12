using System;

Console.Write("Введите x для вычисления sin(x) рядом Маклорена: ");
double x1 = double.Parse(Console.ReadLine());

Console.Write("Введите точность e (e < 0,01, иначе значение по умолчанию 0,01): ");
double e = double.Parse(Console.ReadLine());

if (e > 0.01) e = 0.01;

double result = CalculateSin(x1, e);
Console.WriteLine($"sin({x1}) ≈ {result}");

Console.Write("Введите x для вычисления n-го члена ряда: ");
double x2 = double.Parse(Console.ReadLine());

Console.Write("Введите n для вычисления n-го члена ряда: ");
int n = int.Parse(Console.ReadLine());

double nthTerm = CalculateNthTerm(x2, n);
Console.WriteLine($"{n}-й член ряда: {nthTerm}");

double CalculateSin(double x, double e)
{
    double term = x;
    double sum = term;
    int n = 1;

    term = Math.Pow(-1, n) * (Math.Pow(x, 2 * n + 1) / Factorial(2 * n + 1));

    while (Math.Abs(term) > e)
    {
        n++;
        sum += term;
        term = Math.Pow(-1, n) * (Math.Pow(x, 2 * n + 1) / Factorial(2 * n + 1));
    }

    return sum;
}

double CalculateNthTerm(double x, int n)
{
    return Math.Pow(-1, n) * Math.Pow(x, 2 * n + 1) / Factorial(2 * n + 1);
}

double Factorial(int n)
{
    if (n == 0 || n == 1)
        return 1;
    return n * Factorial(n - 1);
}
