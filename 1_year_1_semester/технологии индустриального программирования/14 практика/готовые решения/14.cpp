// Реализуйте структуру данных "стек". Напишите программу, содержащую описание стека и моделирующую работу стека, реализовав все указанные здесь методы. 
// Программа считывает последовательность команд и в зависимости от команды выполняет ту или иную операцию. 
// После выполнения каждой команды программа должна вывести одну строчку. Возможные команды для программы:
// push n Добавить в стек число n (значение n задается после команды). Программа должна вывести ok. 
// pop Удалить из стека последний элемент. Программа должна вывести его значение. 
// back Программа должна вывести значение последнего элемента, не удаляя его из стека. 
// size Программа должна вывести количество элементов в стеке. clear Программа должна очистить стек и вывести ok. 
// exit Программа должна вывести bye и завершить работу.

// Формат ввода
// push 3
// push 14
// size
// clear
// push 1
// back
// push 2
// back
// pop
// size
// pop
// size
// exit

// Формат вывода
// ok
// ok
// 2
// ok
// ok
// 1
// ok
// 2
// 2
// 1
// 1
// 0
// bye

#include <bits/stdc++.h>
using namespace std;



int main(){
    basic_string<char> num;
    std::string chek ="w";
    std:: string z;
    std:: string input;

    std::stack<std::string> stack;

    while(chek!="wd") {
        getline(std:: cin, input);
        std::istringstream fs(input);
        int i = 0, index = 0;



        while (input.find(' ', index) != -1) {
            index = input.find(' ', index + 1);
            i++;
        }
        if (i == 2) {
            fs >> z >> num;
            if (z == "push") {
                stack.push(num);
                cout << "ok"<<"\n";
            }

        }
        else {
            fs >> z;
            if (z == "pop") {
                std::cout << stack.top() << std::endl;
                stack.pop();
            }
            if (z == "back") {
                std::cout << stack.top() << std::endl;
            }
            if (z == "size") {
                cout <<stack.size() << "\n";
            }
            if (z == "clear") {
                while (!stack.empty()) {
                    stack.pop();
                }
                cout << "ok" <<"\n";
            }
            if (z == "exit") {
                cout << "bye"<<"\n";
                chek="wd";

            }

        }
    }




}