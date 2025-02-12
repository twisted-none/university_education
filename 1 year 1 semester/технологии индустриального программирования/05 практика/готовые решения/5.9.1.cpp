// Аркадий решил системно подойти к выбору друзей, которым он бы хотел показать свою коллекцию игрушек Хагги Вагги, 
// а потому придумал 3 критерия оценки для каждого из своих друзей и внёс эти оценки в документ.

// Необходимо найти средний балл по каждому из критериев между его друзьями, чтобы он мог отделить ровно половину из них под "элиту".

// Формат ввода
// 2
// Markov Valeriy 4 5 2
// Kozlov Georgiy 5 1 2

// Формат вывода
// 4.5 3.0 2.0

#include <iostream>
#include <iomanip>
#include <string>

using namespace std;

int main() {
    int n;
    cin >> n;
    
    int total1 = 0, total2 = 0, total3 = 0;
    
    for (int i = 0; i < n; ++i) {
        string firstName, lastName;
        int score1, score2, score3;
        cin >> firstName >> lastName >> score1 >> score2 >> score3;
        
        total1 += score1;
        total2 += score2;
        total3 += score3;
    }
    
    cout << fixed << setprecision(1) << static_cast<double>(total1) / n << " "
         << static_cast<double>(total2) / n << " "
         << static_cast<double>(total3) / n << endl;
    
    return 0;
}