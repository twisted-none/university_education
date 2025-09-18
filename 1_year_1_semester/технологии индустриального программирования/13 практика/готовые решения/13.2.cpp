// Надоели сообщения с текстом капсом внутри? ("АХАХАХА", "НЕ МОГУ!!!") и прочие? 
// Напиши программу, которая переводит все заглавные буквы в вводимом тексте в строчные.

// Формат ввода
// АХАХАХАХ, треш

// Формат вывода
// ахахахах, треш

#include<bits/stdc++.h>
using namespace std;
int main(){
    string line;
    getline(cin,line);
    transform(line.begin(),line.end(),line.begin(), ::tolower);
    cout<< line;



}
