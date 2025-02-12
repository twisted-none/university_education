// Пауки, осьминоги и сороконожки решили свести Штирлица с ума и придумали схему, по которой каждый подходящий будет стучать в дверь таким образом, что дверь будет заполнена количеством стуков по спирали.

// Необходимо помочь им и написать функцию, которая по заданному количеству животных (N) В ФАЙЛЕ input.txt будет выводить схему постукиваний по квадратной двери (N*N) в файл output.txt

// Формат ввода
// 3

// Формат вывода
// 123
// 894
// 765

#include <iostream>
#include <vector>
#include <fstream>
#include <string>
using namespace std;

int main(){
    int x,y;
    string line;
    ifstream in("input.txt");
    if (in.is_open())
    {
        while (getline(in, line))
        {
            cout << line << endl;
        }
    }
    in.close();
    int n = stoi(line);
    vector<vector<int>> mas(n, vector<int>(n, 0));
    bool up,down,left,right;
    right = true;
    down = false;
    up = false;
    left = false;
    int post = n;
    int perem = n;
    int count = 1;
    int qr = 0;
    x = 0;
    while (qr < n * n + 1){
        x = post - n;
        if (right){
            for (y = post - n; y < n; y++){
                if (mas[x][y] == 0){
                    mas[x][y] = count;
                    count ++;
                }
            }
            right = false;
            down = true;
            qr ++;
        }
        if (down){
            y = n - 1;
            for (int x = post - n + 1; x < n; x ++){
                if (mas[x][y] == 0){
                    mas[x][y] = count;
                    count ++;
                }
            }
            down = false;
            left = true;
            qr ++;
        }
        if (left){
            x = n - 1;
            for(y = n - 1; y >= 0; y--){
                if (mas[x][y] == 0){
                    mas[x][y] = count;
                    count ++;
                }
            }
            left = false;
            up = true;
            qr ++;
        }
        if (up){
            y = post - n;
            n -= 1;
            for(x = n - 1; x >= 0; x --){
                if (mas[x][y] == 0){
                    mas[x][y] = count;
                    count ++;
                }else{
                    up = false;
                    right = true;
                }

            }
            up = false;
            right = true;
            qr ++;
        }
    }
    ofstream out;
    out.open("output.txt");
    if (out.is_open())
    {
        for (int i = 0; i < perem; i++) {
            for (int j = 0; j < perem; j++) {
                out << mas[i][j];
            }
            out << endl;
        }
    }
    out.close();
}