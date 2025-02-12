// Вы - частный детектив, которому доверили расследование наличия состава преступления в заимствованиях шуток 
// Данилой Продольным у Джорджа Карлина. На вход вам даётся строка X из монолога Джорджа Карлина 
// (длиной не более, чем 10000 символов) и строка из последнего стэндапа Данилы Продольного Y (так же не более 10000 символов).
// Необходимо выяснить, является ли Y подстрокой в X

// Формат ввода
// ababacaba abac

// Формат вывода
// yes

#include <iostream>
#include <cstring>
#include <string>
using namespace std;

int main(){
    string first, second;
    cin >> first >> second;
    if (second.length() > first.length()){
        cout << "no";
        return 0;
    } else {
        for (int i = 0; i < first.length(); i++){
            string temp;
            temp += first[i];
            for (int j = i + 1; j < first.length(); j++){
                if (temp.length() < second.length()){
                    temp += first[j];
                } else {
                    break;
                }
            }
            if (temp == second){
                cout << "yes";
                return 0;
            }
        }
        cout << "no";
        return 0;
    }
}