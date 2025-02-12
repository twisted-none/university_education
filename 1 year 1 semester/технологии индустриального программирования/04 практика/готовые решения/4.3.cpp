// Преподавателю по программированию стало нечем занять своих студентов, поэтому он придумал, 
// что хочет получить обработчик текстовых файлов, который работает по следующему алгоритму: 
// программа считывает из текстового файла input.txt строку, состоящую не более, чем из 255 символов. 
// Программа записывает в выходной файл output.txt указанную последовательность символов, 
// кроме случаев, если в данной строке встречаются числа (последовательность цифр = 1 число). 
// Тогда программа преобразует эти числа в двоичную систему счисления.

// Формат ввода
// 6^&678JKjdkdl;?.,lk879Pk1kdfl4839

// Формат вывода
// 110^&1010100110JKjdkdl;?.,lk1101101111Pk1kdfl1001011100111

#include <iostream>
#include <fstream>
#include <string>
using namespace std;

// Функция для преобразования чисел в двоичную систему счисления
string decimalToBinary(int decimal) {
    string binary = "";
    while (decimal > 0) {
        int remainder = decimal % 2;
        binary = to_string(remainder) + binary;
        decimal /= 2;
    }
    return binary;
}

int main() {
    ifstream inputFile("input.txt");
    ofstream outputFile("output.txt");

    if (!inputFile.is_open() || !outputFile.is_open()) {
        cerr << "Не удалось открыть файлы." << endl;
        return 1;
    }

    string line;
    getline(inputFile, line);

    string result = "";
    string currentNumber = "";

    for (char c : line) {
        if (isdigit(c)) {
            currentNumber += c;
        } else {
            if (!currentNumber.empty()) {
                int decimal = stoi(currentNumber);
                string binary = decimalToBinary(decimal);
                result += binary;
                currentNumber.clear();
            }
            result += c;
        }
    }

    // Если строка заканчивается числом, обработаем его
    if (!currentNumber.empty()) {
        int decimal = stoi(currentNumber);
        string binary = decimalToBinary(decimal);
        result += binary;
    }

    outputFile << result << endl;

    inputFile.close();
    outputFile.close();

    return 0;
}
