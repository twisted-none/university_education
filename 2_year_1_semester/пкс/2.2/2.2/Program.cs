using System;

Console.Write("Введите количество строк в первой матрице: ");
int stroka_first = int.Parse(Console.ReadLine());

Console.Write("Введите количество столбцов в первой матрице: ");
int stolbec_first = int.Parse(Console.ReadLine());

Console.WriteLine();

Console.Write("Как вы хотите заполнить матрицу? (1 - в ручную, 2 - случайными числами в диапазоне [a, b]): ");
int first_user_choice = int.Parse(Console.ReadLine());

int[,] first_matrix = new int[stroka_first, stolbec_first];

if (first_user_choice == 1)
{
    first_matrix = CreateManualMatrix(stroka: stroka_first, stolbec: stolbec_first);
}

else
{
    first_matrix = CreateRandomMatrix(stroka: stroka_first, stolbec: stolbec_first);
}

Console.WriteLine();

Console.WriteLine("Вот первая матрица:");

ShowMatrix(matrix: first_matrix, stroka: stroka_first, stolbec: stolbec_first);

Console.WriteLine();

Console.Write("Введите количество строк во второй матрице: ");
int stroka_second = int.Parse(Console.ReadLine());

Console.Write("Введите количество столбцов во второй матрице: ");
int stolbec_second = int.Parse(Console.ReadLine());

Console.WriteLine();

Console.Write("Как вы хотите заполнить матрицу? (1 - в ручную, 2 - случайными числами в диапазоне [a, b]): ");
int second_user_choice = int.Parse(Console.ReadLine());

int[,] second_matrix = new int[stroka_second, stolbec_second];

if (second_user_choice == 1)
{
    second_matrix = CreateManualMatrix(stroka: stroka_second, stolbec: stolbec_second);
}

else
{
    second_matrix = CreateRandomMatrix(stroka: stroka_second, stolbec: stolbec_second);
}

Console.WriteLine();

ShowMatrix(matrix: second_matrix, stroka: stroka_second, stolbec: stolbec_second);

Console.WriteLine();

while (true)
{
    Console.WriteLine("Выберите, что хотите сделать с этими матрицами: ");

    Console.WriteLine("1. Сложение матриц друг с другом");
    Console.WriteLine("2. Умножение матриц друг на друга");
    Console.WriteLine("3. Нахождение определителя первой матрицы");
    Console.WriteLine("4. Нахождение определителя второй матрицы");
    Console.WriteLine("5. Нахождение обратной матрицы для первой матрицы");
    Console.WriteLine("6. Нахождение обратной матрицы для второй матрицы");
    Console.WriteLine("7. Транспонирование первой матрицы");
    Console.WriteLine("8. Транспонирование второй матрицы");
    Console.WriteLine("9. Нахождение корней системы уравнений для первой матрицы");
    Console.WriteLine("10. Нахождение корней системы уравнений для второй матрицы");
    Console.WriteLine("0. Выход");

    Console.Write("Выберите, что вы хотите сделать с матрицами: ");
    int user_choice_matrix = int.Parse(Console.ReadLine());

    Console.WriteLine();

    if (user_choice_matrix == 0) break;

    switch (user_choice_matrix)
    {
        case 1:

            AddictionMatrix(first_matrix, second_matrix, stroka_first, stolbec_first, stroka_second, stolbec_second);

            break;

        case 2:

            MultiplyMatrix(first_matrix, second_matrix, stroka_first, stolbec_first, stroka_second, stolbec_second);

            break;

        case 3:

            if (first_matrix.GetLength(0) != first_matrix.GetLength(1))
            {
                Console.WriteLine("Ошибка: матрица должна быть квадратной для вычисления определителя.");
                break;
            }
            else
            {

                int just_determinator1 = FindDeterminateMatrix(first_matrix);
                Console.WriteLine($"Определитель матрицы равен: {just_determinator1}");

            }

            break;

        case 4:

            if (second_matrix.GetLength(0) != second_matrix.GetLength(1))
            {
                Console.WriteLine("Ошибка: матрица должна быть квадратной для вычисления определителя.");
                break;
            }
            else
            {

                int just_determinator2 = FindDeterminateMatrix(second_matrix);
                Console.WriteLine($"Определитель матрицы равен: {just_determinator2}");

            }

            break;

        case 5:

            if ((first_matrix.GetLength(0) != first_matrix.GetLength(1)))
            {
                Console.WriteLine("Ошибка: чтобы найти обратную матрицу, она должна быть квадратной.");
                break;
            }
            else
            {

                int reverse_det = FindDeterminateMatrix(first_matrix);

                if (reverse_det != 0)
                {

                    ShowReverseMatrix(CreateReverseMatrix(first_matrix, stroka_first, stolbec_first, reverse_det), stroka_first, stolbec_first, reverse_det);

                }

                else
                {
                    Console.WriteLine("Ошибка: определитель равен 0 - обратную матрицу невозможно найти");

                }

            }




            break;
        case 6:

            if ((second_matrix.GetLength(0) != second_matrix.GetLength(1)))
            {
                Console.WriteLine("Ошибка: чтобы найти обратную матрицу, она должна быть квадратной.");
                break;
            }
            else
            {

                int reverse_det = FindDeterminateMatrix(second_matrix);

                if (reverse_det != 0)
                {

                    ShowReverseMatrix(CreateReverseMatrix(second_matrix, stroka_second, stolbec_second, reverse_det), stroka_second, stolbec_second, reverse_det);

                }

                else
                {
                    Console.WriteLine("Ошибка: определитель равен 0 - обратную матрицу невозможно найти");

                }

            }

            break;
        case 7:

            ShowMatrix(TransponirovanieMatrix(first_matrix, stroka_first, stolbec_first), stolbec_first, stroka_first);

            break;

        case 8:

            ShowMatrix(TransponirovanieMatrix(second_matrix, stroka_second, stolbec_second), stolbec_second, stroka_second);

            break;

        case 9:
        case 10:
            int[,] matrixToSolve = (user_choice_matrix == 9) ? first_matrix : second_matrix;
            SolveAndPrintResult(matrixToSolve);
            break;
    }

}

int[,] CreateRandomMatrix(int stroka, int stolbec)
{
    int[,] matrix = new int[stroka, stolbec];

    Console.Write("Введите нижнюю границу для случайных чисел: ");
    int a = int.Parse(Console.ReadLine());

    Console.Write("Введите верхнюю границу для случайных чисел: ");
    int b = int.Parse(Console.ReadLine());

    Random rnd = new Random();

    for (int i = 0; i < stroka; i++)
    {
        for (int j = 0; j < stolbec; j++)
        {

            matrix[i, j] = rnd.Next(a, b + 1);

        }

    }

    return matrix;

}

int[,] CreateManualMatrix(int stroka, int stolbec)
{
    int[,] matrix = new int[stroka, stolbec];

    Console.WriteLine();
    for (int i = 0; i < stroka; i++)
    {
        for (int j = 0; j < stolbec; j++)
        {

            Console.Write($"Введите число для {i + 1} строки и {j + 1} столбца: ");
            matrix[i, j] = int.Parse(Console.ReadLine());

        }

    }

    return matrix;
}

void ShowMatrix(int[,] matrix, int stroka, int stolbec)
{

    for (int i = 0; i < stroka; i++)
    {
        for (int j = 0; j < stolbec; j++)
        {
            Console.Write($"{matrix[i, j]} ");
        }

        Console.WriteLine();
    }

}

void AddictionMatrix(int[,] matrix1, int[,] matrix2, int stroka1, int stolbec1, int stroka2, int stolbec2)
{
    if ((stroka1 == stroka2) && (stolbec1 == stolbec2))
    {
        int[,] new_matrix = new int[stroka1, stolbec1];
        for (int i = 0; i < stroka1; i++)
        {
            for (int j = 0; j < stolbec1; j++)
            {
                new_matrix[i, j] = matrix1[i, j] + matrix2[i, j];
            }
        }
        Console.WriteLine("В ходе сложения получилась следующая матрица: ");
        Console.WriteLine();

        ShowMatrix(new_matrix, stroka1, stolbec1);

    }
    else
    {
        Console.WriteLine("К сожалению, сложение невозможно, так как матрицы разных размеров!");
        Console.WriteLine();
    }
}

void MultiplyMatrix(int[,] matrix1, int[,] matrix2, int stroka1, int stolbec1, int stroka2, int stolbec2)
{
    if (stolbec1 == stroka2)
    {
        int[,] new_matrix = new int[stroka1, stolbec2];
        for (int i = 0; i < stroka1; i++)
        {
            for (int j = 0; j < stolbec2; j++)
            {
                new_matrix[i, j] = 0;
                for (int k = 0; k < stolbec1; k++)
                {
                    new_matrix[i, j] += matrix1[i, k] * matrix2[k, j];
                }
            }
        }
        Console.WriteLine("В ходе умножения получилась следующая матрица: ");
        Console.WriteLine();
        ShowMatrix(new_matrix, stroka1, stolbec2);
    }
    else
    {
        Console.WriteLine("К сожалению, умножение невозможно, так как количество столбцов в первой матрице не равно количеству строк во второй!");
        Console.WriteLine();
    }
}

int FindDeterminateMatrix(int[,] matrix)
{
    int n = matrix.GetLength(0);

    if (n == 1)
        return matrix[0, 0];

    if (n == 2)
        return matrix[0, 0] * matrix[1, 1] - matrix[0, 1] * matrix[1, 0];

    int det = 0;
    for (int j = 0; j < n; j++)
    {
        det += (j % 2 == 1 ? -1 : 1) * matrix[0, j] * FindDeterminateMatrix(GetMinor(matrix, 0, j));
    }

    return det;
}

int[,] GetMinor(int[,] matrix, int row, int col)
{
    int n = matrix.GetLength(0);
    int[,] minor = new int[n - 1, n - 1];
    int m = 0, k = 0;

    for (int i = 0; i < n; i++)
    {
        if (i == row) continue;
        k = 0;
        for (int j = 0; j < n; j++)
        {
            if (j == col) continue;
            minor[m, k] = matrix[i, j];
            k++;
        }
        m++;
    }

    return minor;
}

int[,] TransponirovanieMatrix(int[,] matrix, int stroka, int stolbec)
{

    int[,] new_matrix = new int[stolbec, stroka];
    for (int i = 0; i < stolbec; i++)
    {
        for (int j = 0; j < stroka; j++)
        {
            new_matrix[i, j] = matrix[j, i];
        }
    }

    return new_matrix;

}

int[,] CreateReverseMatrix(int[,] matrix, int stroka, int stolbec, int determinator)
{

    int[,] new_matrix = TransponirovanieMatrix(FindAlgebraiticMatrix(matrix, stroka, stolbec, determinator), stolbec, stroka);

    return new_matrix;

}

int[,] FindAlgebraiticMatrix(int[,] matrix, int stroka, int stolbec, int determinator)
{

    int[,] new_matrix = new int[stroka, stolbec];

    for (int i = 0; i < stroka; i++)
    {
        for (int j = 0; j < stolbec; j++)
        {
            new_matrix[i, j] = (((i + j) % 2 == 1 ? -1 : 1) * FindDeterminateMatrix(GetMinor(matrix, i, j)));
        }
    }

    return new_matrix;


}

void ShowReverseMatrix(int[,] matrix, int stroka, int stolbec, int determinate)
{
    int flag = 0;

    for (int i = 0; i < stroka; i++)
    {
        for (int j = 0; j < stolbec; j++)
        {
            if (((i + 1) * 2 > stroka) && (j == stolbec - 1) && (flag == 0))
            {

                flag = 1;

                if (determinate < 1)
                {
                    Console.Write($"{matrix[i, j]} * -1/{Math.Abs(determinate)}");
                }

                else
                {
                    Console.Write($"{matrix[i, j]} * 1/{determinate}");
                }


            }
            else
            {

                Console.Write($"{matrix[i, j]}  ");

            }

        }

        Console.WriteLine();
    }

}


double[] SolveEquationSystem(int[,] matrix)
{
    int rows = matrix.GetLength(0);
    int cols = matrix.GetLength(1);

    if (cols != rows + 1)
    {
        Console.WriteLine("Ошибка: матрица должна иметь размер n x (n+1), где n - количество неизвестных.");
        return null;
    }

    int[,] A = new int[rows, rows];
    double[] b = new double[rows];

    for (int i = 0; i < rows; i++)
    {
        for (int j = 0; j < rows; j++)
        {
            A[i, j] = matrix[i, j];
        }
        b[i] = matrix[i, rows];
    }

    int det = FindDeterminateMatrix(A);
    if (Math.Abs(det) < 1e-10)
    {
        Console.WriteLine("Определитель матрицы A равен нулю.");
        if (IsConsistent(A, b))
        {
            Console.WriteLine("Система имеет бесконечно много решений.");
        }
        else
        {
            Console.WriteLine("Система не имеет решений.");
        }
        return null;
    }

    return GaussMethod(A, b);
}

double[] GaussMethod(int[,] A, double[] b)
{
    int n = b.Length;
    double[] x = new double[n];
    double[,] augmentedMatrix = new double[n, n + 1];

    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n; j++)
        {
            augmentedMatrix[i, j] = A[i, j];
        }
        augmentedMatrix[i, n] = b[i];
    }

    for (int k = 0; k < n; k++)
    {
        int maxRow = k;
        for (int i = k + 1; i < n; i++)
        {
            if (Math.Abs(augmentedMatrix[i, k]) > Math.Abs(augmentedMatrix[maxRow, k]))
            {
                maxRow = i;
            }
        }

        if (maxRow != k)
        {
            for (int j = k; j <= n; j++)
            {
                double temp = augmentedMatrix[k, j];
                augmentedMatrix[k, j] = augmentedMatrix[maxRow, j];
                augmentedMatrix[maxRow, j] = temp;
            }
        }

        if (Math.Abs(augmentedMatrix[k, k]) < 1e-10)
        {
            Console.WriteLine("Матрица вырождена, точное решение невозможно.");
            return null;
        }

        for (int i = k + 1; i < n; i++)
        {
            double factor = augmentedMatrix[i, k] / augmentedMatrix[k, k];
            for (int j = k; j <= n; j++)
            {
                augmentedMatrix[i, j] -= factor * augmentedMatrix[k, j];
            }
        }
    }

    for (int i = n - 1; i >= 0; i--)
    {
        x[i] = augmentedMatrix[i, n];
        for (int j = i + 1; j < n; j++)
        {
            x[i] -= augmentedMatrix[i, j] * x[j];
        }
        x[i] /= augmentedMatrix[i, i];
    }

    return x;
}

bool IsConsistent(int[,] A, double[] b)
{
    int n = A.GetLength(0);
    for (int i = 0; i < n; i++)
    {
        bool allZero = true;
        for (int j = 0; j < n; j++)
        {
            if (Math.Abs(A[i, j]) > 1e-10)
            {
                allZero = false;
                break;
            }
        }
        if (allZero && Math.Abs(b[i]) > 1e-10)
        {
            return false;
        }
    }
    return true;
}

void SolveAndPrintResult(int[,] matrix)
{
    double[] solution = SolveEquationSystem(matrix);
    if (solution != null)
    {
        Console.WriteLine("Решение системы уравнений:");
        for (int i = 0; i < solution.Length; i++)
        {
            Console.WriteLine($"x{i + 1} = {solution[i]:F4}");
        }
    }
}