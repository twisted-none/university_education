#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QPushButton>
#include <QPoint>
#include <QGraphicsOpacityEffect>
#include <QPropertyAnimation>

namespace Ui { class MainWindow; }

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void handleCellClick(int row, int col);
    void on_saveButton_clicked();
    void on_loadButton_clicked();

private:
    Ui::MainWindow *ui;

    QPushButton *gameBoard[8][8];
    QPoint firstClick{-1, -1};
    QPoint secondClick{-1, -1};

    void initializeBoard();
    void processMove();
    bool areAdjacent(const QPoint &a, const QPoint &b);
    void swapElements(const QPoint &a, const QPoint &b);
    bool checkMatches();
    bool checkRowMatch(int row, int col);
    bool checkColMatch(int row, int col);
    void markForDeletion(int row, int col);
    void clearMatches();
    void refillBoard();
    void resetClicks();

    // Новые функции для анимации
    void animateMove(int fromRow, int fromCol, int toRow, int toCol);
    void animateSpawn(int row, int col);
};

#endif // MAINWINDOW_H
