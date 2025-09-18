#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QPushButton>
#include <QRandomGenerator>
#include <QMessageBox>
#include <QFile>
#include <QTextStream>
#include <QPropertyAnimation>
#include <QDebug>
#include <QTimer>

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
    QStringList colors = {"red", "orange", "yellow", "green", "blue", "indigo", "violet"};

    for (int row = 0; row < 8; ++row) {
        for (int col = 0; col < 8; ++col) {
            QPushButton *button = new QPushButton(this);
            button->setFixedSize(50, 50);
            button->setStyleSheet("padding: 0; margin: 0;");

            int colorIndex = QRandomGenerator::global()->bounded(colors.size());
            QString color = colors[colorIndex];

            button->setStyleSheet(QString("background-color: %1; border: 1px solid black;").arg(color));
            button->setProperty("colorName", color);  // Сохраняем цвет в свойство

            ui->gridLayout->addWidget(button, row, col);
            connect(button, &QPushButton::clicked, this, [=]() {
                handleCellClick(row, col);
            });
            gameBoard[row][col] = button;
        }
    }

    ui->gridLayout->setContentsMargins(0, 0, 0, 0);
    ui->gridLayout->setSpacing(0);
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
    QString tempColor = gameBoard[a.x()][a.y()]->property("colorName").toString();
    QString otherColor = gameBoard[b.x()][b.y()]->property("colorName").toString();

    gameBoard[a.x()][a.y()]->setStyleSheet(QString("background-color: %1; border: 1px solid black;").arg(otherColor));
    gameBoard[a.x()][a.y()]->setProperty("colorName", otherColor);

    gameBoard[b.x()][b.y()]->setStyleSheet(QString("background-color: %1; border: 1px solid black;").arg(tempColor));
    gameBoard[b.x()][b.y()]->setProperty("colorName", tempColor);
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
    if (col <= 5 &&
        gameBoard[row][col]->property("colorName").toString() == gameBoard[row][col + 1]->property("colorName").toString() &&
        gameBoard[row][col]->property("colorName").toString() == gameBoard[row][col + 2]->property("colorName").toString())
    {
        markForDeletion(row, col);
        markForDeletion(row, col + 1);
        markForDeletion(row, col + 2);
        return true;
    }
    return false;
}

bool MainWindow::checkColMatch(int row, int col)
{
    if (row <= 5 &&
        gameBoard[row][col]->property("colorName").toString() == gameBoard[row + 1][col]->property("colorName").toString() &&
        gameBoard[row][col]->property("colorName").toString() == gameBoard[row + 2][col]->property("colorName").toString())
    {
        markForDeletion(row, col);
        markForDeletion(row + 1, col);
        markForDeletion(row + 2, col);
        return true;
    }
    return false;
}

void MainWindow::markForDeletion(int row, int col)
{
    gameBoard[row][col]->setStyleSheet("background-color: transparent; border: 1px solid black;");
    gameBoard[row][col]->setProperty("colorName", "");
}


void MainWindow::clearMatches()
{
    QStringList colors = {"red", "orange", "yellow", "green", "blue", "indigo", "violet"};

    for (int row = 0; row < 8; ++row) {
        for (int col = 0; col < 8; ++col) {
            if (gameBoard[row][col]->property("colorName").toString().isEmpty()) {
                int colorIndex = QRandomGenerator::global()->bounded(colors.size());
                QString newColor = colors[colorIndex];

                gameBoard[row][col]->setStyleSheet(QString("background-color: %1; border: 1px solid black;").arg(newColor));
                gameBoard[row][col]->setProperty("colorName", newColor);
            }
        }
    }
}


void MainWindow::refillBoard()
{
    QStringList colors = {"red", "orange", "yellow", "green", "blue", "indigo", "violet"};

    // Шаг 1: Ячейки падают вниз
    for (int col = 0; col < 8; ++col) {
        int emptyRow = 7;
        for (int row = 7; row >= 0; --row) {
            if (!gameBoard[row][col]->property("colorName").toString().isEmpty()) {
                if (row != emptyRow) {
                    animateMove(row, col, emptyRow, col);
                    gameBoard[emptyRow][col]->setStyleSheet(gameBoard[row][col]->styleSheet());
                    gameBoard[emptyRow][col]->setProperty("colorName", gameBoard[row][col]->property("colorName"));

                    gameBoard[row][col]->setStyleSheet("background-color: transparent; border: 1px solid black;");
                    gameBoard[row][col]->setProperty("colorName", "");
                }
                --emptyRow;
            }
        }
    }

    // Шаг 2: Появление новых ячеек через 3 секунды
    QTimer::singleShot(3000, this, [=]() {
        for (int col = 0; col < 8; ++col) {
            for (int row = 7; row >= 0; --row) {
                if (gameBoard[row][col]->property("colorName").toString().isEmpty()) {
                    int colorIndex = QRandomGenerator::global()->bounded(colors.size());
                    QString newColor = colors[colorIndex];
                    gameBoard[row][col]->setStyleSheet(QString("background-color: %1; border: 1px solid black;").arg(newColor));
                    gameBoard[row][col]->setProperty("colorName", newColor);
                    animateSpawn(row, col);
                }
            }
        }
    });
}


void MainWindow::animateMove(int fromRow, int fromCol, int toRow, int toCol)
{
    QPushButton *button = gameBoard[fromRow][fromCol];
    QRect startRect = ui->gridLayout->cellRect(fromRow, fromCol);
    QRect endRect = ui->gridLayout->cellRect(toRow, toCol);

    QPropertyAnimation *animation = new QPropertyAnimation(button, "geometry", this);
    animation->setDuration(500);
    animation->setStartValue(startRect);
    animation->setEndValue(endRect);
    animation->setEasingCurve(QEasingCurve::OutBounce);

    connect(animation, &QPropertyAnimation::finished, this, [=]() {
        ui->gridLayout->addWidget(button, toRow, toCol);
        gameBoard[toRow][toCol] = button;
        gameBoard[fromRow][fromCol]->setStyleSheet("background-color: transparent; border: 1px solid black;");
        gameBoard[fromRow][fromCol]->setProperty("colorName", "");
        qDebug() << "Анимация перемещения завершена:" << fromRow << fromCol << "->" << toRow << toCol;
    });

    animation->start(QAbstractAnimation::DeleteWhenStopped);
}

void MainWindow::animateSpawn(int row, int col)
{
    QPushButton *button = gameBoard[row][col];
    QGraphicsOpacityEffect *effect = new QGraphicsOpacityEffect(this);
    button->setGraphicsEffect(effect);

    QPropertyAnimation *fadeIn = new QPropertyAnimation(effect, "opacity", this);
    fadeIn->setDuration(500);
    fadeIn->setStartValue(0);
    fadeIn->setEndValue(1);
    fadeIn->start(QAbstractAnimation::DeleteWhenStopped);

    qDebug() << "Анимация появления ячейки:" << row << col;
}




void MainWindow::resetClicks()
{
    if (firstClick.x() >= 0 && firstClick.y() >= 0) {
        QString originalColor = gameBoard[firstClick.x()][firstClick.y()]->property("colorName").toString();
        gameBoard[firstClick.x()][firstClick.y()]->setStyleSheet(
            QString("background-color: %1; border: 1px solid black;").arg(originalColor));
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
