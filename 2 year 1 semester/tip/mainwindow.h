#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QPushButton>
#include <QPoint>

QT_BEGIN_NAMESPACE
namespace Ui { class MainWindow; }
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void on_saveButton_clicked();
    void on_loadButton_clicked();

private:
    Ui::MainWindow *ui;

    QPushButton *gameBoard[8][8];
    QPoint firstClick;
    QPoint secondClick;

    void initializeBoard();
    void handleCellClick(int row, int col);
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
};

#endif // MAINWINDOW_H
