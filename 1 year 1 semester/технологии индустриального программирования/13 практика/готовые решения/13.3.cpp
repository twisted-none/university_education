// Просто и без легенды. Написать функцию, которая, если вводится два числа, то выводит их произведение, 
// если вводится число, затем знак (+), (-), (*) или (/) выводит результат соответствующей операции.

// Необходимо использовать перегрузку функции.

// Формат ввода
// 1 2

// Формат вывода
// 2

#include <bits/stdc++.h>
using namespace std;




int main(){
    int num1,num2;
    std:: string z;
    std:: string input;
    getline(std:: cin, input);
    std::istringstream fs(input);
    string op[4]{"+","-","/","*"};
    
    int i = 0, index = 0;

    while (input.find(' ', index) != -1) {
        index = input.find(' ', index + 1);
        i++;
    }
    if (i ==3){
        fs >> num1 >> z >> num2;
            if(z=="+"){
                cout <<num1+num2;
            }
            if(z=="-"){
                cout <<num1-num2;
            }
            if(z=="*"){
                cout <<num1*num2;
            }
            if(z=="/"){
                cout <<num1/num2;
            }

    }
    else{
        fs>> num1 >> num2;
        cout << num1 * num2;

    }



}