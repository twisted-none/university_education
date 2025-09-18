#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QPushButton>
#include <QRandomGenerator>
#include <QMessageBox>
#include <QFile>
#include <QTextStream>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    initializeBoard();
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::initializeBoard()
{
    for (int row = 0; row < 8; ++row) {
        for (int col = 0; col < 8; ++col) {
            QPushButton *button = new QPushButton(this);
            button->setFixedSize(50, 50);  // Размер каждой кнопки
            button->setStyleSheet("padding: 0; margin: 0;");  // Убираем внутренние отступы
            int value = QRandomGenerator::global()->bounded(1, 6);
            button->setText(QString::number(value));
            ui->gridLayout->addWidget(button, row, col);
            connect(button, &QPushButton::clicked, this, [=]() {
                handleCellClick(row, col);
            });
            gameBoard[row][col] = button;
        }
    }

    // Убираем отступы для layout
    ui->gridLayout->setContentsMargins(0, 0, 0, 0);  // Убираем все внешние отступы
    ui->gridLayout->setSpacing(0);  // Убираем расстояние между кнопками
}


void MainWindow::handleCellClick(int row, int col)
{
    if (firstClick.x() < 0 || firstClick.y() < 0) {
        firstClick = QPoint(row, col);
        gameBoard[row][col]->setStyleSheet("background-color: lightblue;");
    } else {
        secondClick = QPoint(row, col);
        processMove();
    }
}

void MainWindow::processMove()
{
    if (areAdjacent(firstClick, secondClick)) {
        swapElements(firstClick, secondClick);
        if (!checkMatches()) {
            swapElements(firstClick, secondClick);  // отмена хода
        } else {
            clearMatches();
            refillBoard();
        }
    }
    resetClicks();
}

bool MainWindow::areAdjacent(const QPoint &a, const QPoint &b)
{
    int dx = abs(a.x() - b.x());
    int dy = abs(a.y() - b.y());
    return (dx == 1 && dy == 0) || (dx == 0 && dy == 1);
}

void MainWindow::swapElements(const QPoint &a, const QPoint &b)
{
    QString temp = gameBoard[a.x()][a.y()]->text();
    gameBoard[a.x()][a.y()]->setText(gameBoard[b.x()][b.y()]->text());
    gameBoard[b.x()][b.y()]->setText(temp);
}

bool MainWindow::checkMatches()
{
    bool foundMatch = false;
    for (int row = 0; row < 8; ++row) {
        for (int col = 0; col < 8; ++col) {
            if (checkRowMatch(row, col) || checkColMatch(row, col)) {
                foundMatch = true;
            }
        }
    }
    return foundMatch;
}

bool MainWindow::checkRowMatch(int row, int col)
{
    if (col <= 5 && gameBoard[row][col]->text() == gameBoard[row][col + 1]->text() &&
        gameBoard[row][col]->text() == gameBoard[row][col + 2]->text()) {
        markForDeletion(row, col);
        markForDeletion(row, col + 1);
        markForDeletion(row, col + 2);
        return true;
    }
    return false;
}

bool MainWindow::checkColMatch(int row, int col)
{
    if (row <= 5 && gameBoard[row][col]->text() == gameBoard[row + 1][col]->text() &&
        gameBoard[row][col]->text() == gameBoard[row + 2][col]->text()) {
        markForDeletion(row, col);
        markForDeletion(row + 1, col);
        markForDeletion(row + 2, col);
        return true;
    }
    return false;
}

void MainWindow::markForDeletion(int row, int col)
{
    gameBoard[row][col]->setStyleSheet("background-color: red;");
    gameBoard[row][col]->setText("");
}

void MainWindow::clearMatches()
{
    for (int row = 0; row < 8; ++row) {
        for (int col = 0; col < 8; ++col) {
            if (gameBoard[row][col]->text().isEmpty()) {
                gameBoard[row][col]->setText(QString::number(QRandomGenerator::global()->bounded(1, 6)));
                gameBoard[row][col]->setStyleSheet("");
            }
        }
    }
}

void MainWindow::refillBoard()
{
    // Для каждого столбца
    for (int col = 0; col < 8; ++col) {
        // Проходим по столбцу снизу вверх
        for (int row = 7; row >= 0; --row) {
            if (gameBoard[row][col]->text().isEmpty()) { // Если ячейка пуста
                // Ищем ближайшую ненулевую ячейку сверху
                for (int k = row - 1; k >= 0; --k) {
                    if (!gameBoard[k][col]->text().isEmpty()) {
                        // Перемещаем значение вниз
                        gameBoard[row][col]->setText(gameBoard[k][col]->text());
                        gameBoard[k][col]->setText(""); // Очищаем исходную ячейку
                        break;
                    }
                }
                // Если пустое место все еще не заполнено, генерируем новое значение сверху
                if (gameBoard[row][col]->text().isEmpty()) {
                    gameBoard[row][col]->setText(QString::number(QRandomGenerator::global()->bounded(1, 6)));
                }
            }
        }
    }
}



void MainWindow::resetClicks()
{
    if (firstClick.x() >= 0 && firstClick.y() >= 0) {
        gameBoard[firstClick.x()][firstClick.y()]->setStyleSheet("");
    }
    firstClick = QPoint(-1, -1);
    secondClick = QPoint(-1, -1);
}

void MainWindow::on_saveButton_clicked()
{
    QFile file("savegame.txt");
    if (file.open(QIODevice::WriteOnly | QIODevice::Text)) {
        QTextStream out(&file);
        for (int row = 0; row < 8; ++row) {
            for (int col = 0; col < 8; ++col) {
                out << gameBoard[row][col]->text() << " ";
            }
            out << "\n";
        }
    }
    QMessageBox::information(this, "Сохранение игры", "Игра сохранена.");
}

void MainWindow::on_loadButton_clicked()
{
    QFile file("savegame.txt");
    if (file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        QTextStream in(&file);
        for (int row = 0; row < 8; ++row) {
            for (int col = 0; col < 8; ++col) {
                QString value;
                in >> value;
                gameBoard[row][col]->setText(value);
                gameBoard[row][col]->setStyleSheet("");
            }
        }
    }
    QMessageBox::information(this, "Загрузка игры", "Игра загружена.");
}
