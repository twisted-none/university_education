// Коммунист Эмиль стал главой товарищества дома по улице Ленина, 17, в котором находятся N квартир. 
// Желая устранить несправедливость и зная стоимость квартир, Эмиль решил, что посчитает количество тех угнетателей пролетариата, 
// чья квартира дороже квартир соседей. Помогите ему в этом нелёгком труде.
// Соседями считаются квартиры, расположенные слева и справа от заданной квартиры (при наличии). 
// В первой строке вводится число N - количество квартир. Во второй строке записаны N чисел.

// Формат ввода
// 5
// 1 2 3 4 5

// Формат вывода
// 1
#include <iostream>

int main() {
    int N;
    std::cin >> N;

    int *apartments = new int[N];
    for (int i = 0; i < N; i++) {
        std::cin >> apartments[i];
    }

    int oppressors = 0;

    for (int i = 0; i < N; i++) {
        if ((i == 0 && apartments[i] > apartments[i + 1]) ||
            (i == N - 1 && apartments[i] > apartments[i - 1]) ||
            (apartments[i] > apartments[i - 1] && apartments[i] > apartments[i + 1])) {
            oppressors++;
        }
    }

    std::cout << oppressors << std::endl;

    delete[] apartments;
    return 0;
}