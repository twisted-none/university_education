#include "mainwindow.h"
#include "ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    num1Edit = findChild<QLineEdit*>("num1Edit");
    num2Edit = findChild<QLineEdit*>("num2Edit");
    resultLabel = findChild<QLabel*>("resultLabel");

    connect(findChild<QPushButton*>("addButton"), &QPushButton::clicked, this, &MainWindow::on_addButton_clicked);
    connect(findChild<QPushButton*>("subtractButton"), &QPushButton::clicked, this, &MainWindow::on_subtractButton_clicked);
    connect(findChild<QPushButton*>("multiplyButton"), &QPushButton::clicked, this, &MainWindow::on_multiplyButton_clicked);
    connect(findChild<QPushButton*>("divideButton"), &QPushButton::clicked, this, &MainWindow::on_divideButton_clicked);
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::on_addButton_clicked()
{
    double result = num1Edit->text().toDouble() + num2Edit->text().toDouble();
    resultLabel->setText(QString("Результат: %1").arg(result));
}

void MainWindow::on_subtractButton_clicked()
{
    double result = num1Edit->text().toDouble() - num2Edit->text().toDouble();
    resultLabel->setText(QString("Результат: %1").arg(result));
}

void MainWindow::on_multiplyButton_clicked()
{
    double result = num1Edit->text().toDouble() * num2Edit->text().toDouble();
    resultLabel->setText(QString("Результат: %1").arg(result));
}

void MainWindow::on_divideButton_clicked()
{
    double num2 = num2Edit->text().toDouble();
    if (num2 != 0) {
        double result = num1Edit->text().toDouble() / num2;
        resultLabel->setText(QString("Результат: %1").arg(result));
    } else {
        resultLabel->setText("Результат: Ошибка (деление на ноль)");
    }
}
