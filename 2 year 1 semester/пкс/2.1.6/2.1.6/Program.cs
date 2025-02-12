using System;

Console.Write("Введите количество бактерий: ");
int total_bakteriy = int.Parse(Console.ReadLine());

Console.Write("Введите количество антибиотика: ");
int total_antibiotic = int.Parse(Console.ReadLine());

int antibiotic_duration = 10;

while (total_bakteriy > 0 & antibiotic_duration > 0)
{
    total_bakteriy *= 2;
    total_bakteriy -= total_antibiotic * antibiotic_duration;

    antibiotic_duration -= 1;

    if (total_bakteriy > 0) Console.WriteLine($"После {10 - antibiotic_duration} часа бактерий осталось: {total_bakteriy}");
    else Console.WriteLine($"После {10 - antibiotic_duration} часа бактерии закончились");

}