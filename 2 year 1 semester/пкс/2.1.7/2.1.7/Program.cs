using System;

Console.Write("Введите n: ");
int n = int.Parse(Console.ReadLine());

Console.Write("Введите a: ");
int a = int.Parse(Console.ReadLine());

Console.Write("Введите b: ");
int b = int.Parse(Console.ReadLine());

Console.Write("Введите w: ");
int w = int.Parse(Console.ReadLine());

Console.Write("Введите h: ");
int h = int.Parse(Console.ReadLine());

int left = 0;
int right = Math.Min(w, h) / 2;
int d = 0;

while (left <= right)
{
    int mid = (left + right) / 2;
    int moduleWidth = a + 2 * mid;
    int moduleHeight = b + 2 * mid;

    int modulesPerRow = w / moduleWidth;
    int modulesPerColumn = h / moduleHeight;

    if (modulesPerRow * modulesPerColumn >= n)
    {
        d = mid;
        left = mid + 1;
    }
    else
    {
        right = mid - 1;
    }
}

Console.WriteLine($"Ответ d = {d}");