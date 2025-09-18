// Аркадий доигрался и уронил стопку с личными делами на каждого из своих друзей. Помогите собрать все необходимые документы в правильном порядке!

// Стопка документов упала листами следующим образом: сначала располагается Фамилия, потом Имя, потом Класс и Дата рождения.

// Составьте отсортированный список по названию класса, а внутри класса по фамилиям из его друзей.

// Формат ввода
// 3
// Sidorov
// Sidor
// 9A
// 20.07.93
// Petrov
// Petr
// 9B
// 23.10.92
// Ivanov
// Ivan
// 9A
// 10.04.93

// Формат вывода
// 9A Ivanov Ivan 10.04.93
// 9A Sidorov Sidor 20.07.93
// 9B Petrov Petr 23.10.92

#include <iostream>
#include <string>
#include <map>
using namespace std;
int main() {
 int n;
 cin >> n;
 map <string, string> aga;
 for (int i = 0; i < n; i++) {
  string surname, name, cl, dt, skl1, skl2;
  cin >> surname >> name >> cl >> dt;
  skl1 = cl + " " + surname + " " + name;
  skl2 = dt;
  aga.insert(make_pair(skl1, skl2));
 }
 map <string, string> ::iterator it;
 for (it = aga.begin(); it != aga.end(); it++) {
  cout << (*it).first << " " << (*it).second << endl;
 }
}