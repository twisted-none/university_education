// Алексею надоело читать пользовательские соглашения, поэтому он решил собрать все текстовые файлы с ними и попортить каждое
// из них следующим образом: он берёт текстовый файл и удаляет из него буквы, которые содержаться во фразе "user agreement", 
// то есть буквы "u", "s", "e" и т.д. вне зависимости от их регистра.

// Необходимо помочь автоматизировать Лёше этот процесс. На вход программа получает файл input.txt, в файл output.txt выводит
//  текст из файла input.txt без соответствующих букв.

// Формат ввода
// useragreement45kkl

// Формат вывода
// 45kkl

#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>

int main() {
    std::ifstream input_file("input.txt");
    std::ofstream output_file("output.txt");

    if (input_file.is_open() && output_file.is_open()) {
        std::string data;
        std::getline(input_file, data);

        data.erase(std::remove_if(data.begin(), data.end(), [](char c) {
            return (c == 'u' || c == 's' || c == 'e' || c == 'r' || c == 'a' || c == 'g' || c == 'm' || c == 'n' ||
                    c == 't');
        }), data.end());

        output_file << data;

        input_file.close();
        output_file.close();
    }
}
