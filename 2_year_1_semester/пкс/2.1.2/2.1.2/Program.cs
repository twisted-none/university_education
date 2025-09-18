using System;



while (true)
{
    Console.Write("Введите номер билета: ");
    int bilet = int.Parse(Console.ReadLine());

    int first_half = 0;
    int second_half = 0;
    int count_of_numbers = 6;


    for (int i = 0; i < count_of_numbers; i++)
    {
        if (i < count_of_numbers / 2)
        {
            second_half += (bilet % 10);
            bilet /= 10;
        }
        else
        {
            first_half += bilet % 10;
            bilet /= 10;
        }
    }

    if (first_half == second_half) Console.WriteLine("True");
    else Console.WriteLine("False");

}