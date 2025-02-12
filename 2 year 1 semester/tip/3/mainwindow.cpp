#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QtMath>
#include <QRegularExpression>
#include <limits>
#include <cmath>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    connect(ui->addButton, &QPushButton::clicked, this, &MainWindow::onOperationButtonClicked);
    connect(ui->subtractButton, &QPushButton::clicked, this, &MainWindow::onOperationButtonClicked);
    connect(ui->multiplyButton, &QPushButton::clicked, this, &MainWindow::onOperationButtonClicked);
    connect(ui->divideButton, &QPushButton::clicked, this, &MainWindow::onOperationButtonClicked);
    connect(ui->sinButton, &QPushButton::clicked, this, &MainWindow::onTrigFunctionButtonClicked);
    connect(ui->cosButton, &QPushButton::clicked, this, &MainWindow::onTrigFunctionButtonClicked);
    connect(ui->tanButton, &QPushButton::clicked, this, &MainWindow::onTrigFunctionButtonClicked);
    connect(ui->cotButton, &QPushButton::clicked, this, &MainWindow::onTrigFunctionButtonClicked);
    connect(ui->asinButton, &QPushButton::clicked, this, &MainWindow::onTrigFunctionButtonClicked);
    connect(ui->acosButton, &QPushButton::clicked, this, &MainWindow::onTrigFunctionButtonClicked);
    connect(ui->atanButton, &QPushButton::clicked, this, &MainWindow::onTrigFunctionButtonClicked);
    connect(ui->acotButton, &QPushButton::clicked, this, &MainWindow::onTrigFunctionButtonClicked);

    // Удалили установку валидатора
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::onOperationButtonClicked()
{
    QString num1 = ui->number1LineEdit->text().toLower();
    QString num2 = ui->number2LineEdit->text().toLower();

    if (!validateInput(num1) || !validateInput(num2)) {
        ui->resultLabel->setText("Ошибка: некорректный ввод");
        return;
    }

    double dec1 = convertToDouble(num1);
    double dec2 = convertToDouble(num2);

    double result;
    QPushButton* clickedButton = qobject_cast<QPushButton*>(sender());

    if (clickedButton == ui->addButton) {
        result = dec1 + dec2;
    } else if (clickedButton == ui->subtractButton) {
        result = dec1 - dec2;
    } else if (clickedButton == ui->multiplyButton) {
        result = dec1 * dec2;
    } else if (clickedButton == ui->divideButton) {
        if (dec2 == 0) {
            ui->resultLabel->setText("Ошибка: деление на ноль");
            return;
        }
        result = dec1 / dec2;
    } else {
        ui->resultLabel->setText("Ошибка: неизвестная операция");
        return;
    }

    displayResult(result);
}

void MainWindow::onTrigFunctionButtonClicked()
{
    QString input1 = ui->number1LineEdit->text().toLower();
    QString input2 = ui->number2LineEdit->text().toLower();

    if (!validateInput(input1)) {
        ui->resultLabel->setText("Ошибка: некорректный ввод в поле Число 1");
        return;
    }

    double value = convertToDouble(input1);
    QString function = qobject_cast<QPushButton*>(sender())->text();

    if (!input2.isEmpty()) {
        if (!validateInput(input2)) {
            ui->resultLabel->setText("Ошибка: некорректный ввод в поле Число 2");
            return;
        }
        double angle = convertToDouble(input2);
        if (ui->radioButton_grad->isChecked()) {
            angle = qDegreesToRadians(angle);
        }
        if (function == "sin") {
            value *= qSin(angle);
        } else if (function == "cos") {
            value *= qCos(angle);
        } else if (function == "tan") {
            value *= qTan(angle);
        } else if (function == "cot") {
            value *= (1.0 / qTan(angle));
        } else {
            ui->resultLabel->setText("Ошибка: некорректная операция для двух чисел");
            return;
        }
    } else {
        if (ui->radioButton_grad->isChecked() && (function == "sin" || function == "cos" || function == "tan" || function == "cot")) {
            value = qDegreesToRadians(value);
        }
        value = calculateTrigFunction(value, function);
        if (ui->radioButton_grad->isChecked() && (function == "asin" || function == "acos" || function == "atan" || function == "acot")) {
            value = qRadiansToDegrees(value);
        }
    }

    displayResult(value);
}

bool MainWindow::validateInput(const QString &number)
{
    if (number.toLower() == "inf") {
        return true;
    }
    QRegularExpression re("^[-+]?[0-9]*\\.?[0-9]+([eE][-+]?[0-9]+)?$");
    return re.match(number).hasMatch();
}

double MainWindow::convertToDouble(const QString &number)
{
    if (number.toLower() == "inf") {
        return std::numeric_limits<double>::infinity();
    }
    return number.toDouble();
}

void MainWindow::displayResult(double result)
{
    const double epsilon = 1e-12;  // Погрешность для сравнения с нулем

    if (qIsInf(result)) {
        ui->resultLabel->setText("Результат: бесконечность");
    } else if (qIsNaN(result)) {
        ui->resultLabel->setText("Ошибка: результат - не число");
    } else if (qAbs(result) > std::numeric_limits<double>::max()) {
        ui->resultLabel->setText("Результат: слишком большое число");
    } else if (qAbs(result) < std::numeric_limits<double>::min() && result != 0) {
        ui->resultLabel->setText("Результат: слишком маленькое число");
    } else if (qAbs(result) < epsilon) {
        ui->resultLabel->setText("Результат: 0");
    } else {
        ui->resultLabel->setText(QString("Результат: %1").arg(result, 0, 'g', 15));
    }
}

double MainWindow::calculateTrigFunction(double value, const QString &function)
{
    const double pi = M_PI;
    const double epsilon = 1e-12;  // Погрешность для сравнения с нулем

    if (function == "sin") {
        if (std::fmod(value, pi) < epsilon) return 0.0;
        return qSin(value);
    }
    if (function == "cos") {
        if (std::fmod(value + pi/2, pi) < epsilon) return 0.0;
        return qCos(value);
    }
    if (function == "tan") {
        if (std::fmod(value, pi) < epsilon) return 0.0;
        if (std::fmod(value + pi/2, pi) < epsilon) return std::numeric_limits<double>::infinity();
        return qTan(value);
    }
    if (function == "cot") {
        if (std::fmod(value, pi) < epsilon) return std::numeric_limits<double>::infinity();
        if (std::fmod(value + pi/2, pi) < epsilon) return 0.0;
        return 1.0 / qTan(value);
    }
    if (function == "asin") {
        if (qAbs(value) > 1) return std::numeric_limits<double>::quiet_NaN();
        return qAsin(value);
    }
    if (function == "acos") {
        if (qAbs(value) > 1) return std::numeric_limits<double>::quiet_NaN();
        return qAcos(value);
    }
    if (function == "atan") return qAtan(value);
    if (function == "acot") return pi/2 - qAtan(value);

    return 0.0;
}
