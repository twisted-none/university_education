#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QtMath>
#include <QRegularExpression>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    connect(ui->addButton, &QPushButton::clicked, this, &MainWindow::onOperationButtonClicked);
    connect(ui->subtractButton, &QPushButton::clicked, this, &MainWindow::onOperationButtonClicked);
    connect(ui->multiplyButton, &QPushButton::clicked, this, &MainWindow::onOperationButtonClicked);
    connect(ui->divideButton, &QPushButton::clicked, this, &MainWindow::onOperationButtonClicked);
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::onOperationButtonClicked()
{
    QString num1 = ui->number1LineEdit->text();
    QString base1Str = ui->base1LineEdit->text();
    QString num2 = ui->number2LineEdit->text();
    QString base2Str = ui->base2LineEdit->text();
    QString resultBaseStr = ui->resultBaseLineEdit->text();

    bool ok;
    int base1 = base1Str.toInt(&ok);
    if (!ok || base1 < 2 || base1 > 36) {
        ui->resultLabel->setText("Ошибка в основании системы счисления для числа 1");
        return;
    }

    int base2 = base2Str.toInt(&ok);
    if (!ok || base2 < 2 || base2 > 36) {
        ui->resultLabel->setText("Ошибка в основании системы счисления для числа 2");
        return;
    }

    int resultBase = resultBaseStr.toInt(&ok);
    if (!ok || resultBase < 2 || resultBase > 36) {
        ui->resultLabel->setText("Ошибка в основании системы счисления для результата");
        return;
    }

    if (!validateInput(num1, base1)) {
        ui->resultLabel->setText("Ошибка в числе 1");
        return;
    }

    if (!validateInput(num2, base2)) {
        ui->resultLabel->setText("Ошибка в числе 2");
        return;
    }

    double dec1 = convertToDecimal(num1, base1);
    double dec2 = convertToDecimal(num2, base2);

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

    QString resultStr = convertFromDecimal(result, resultBase);
    ui->resultLabel->setText(resultStr);
}

bool MainWindow::validateInput(const QString &number, int base)
{
    QString validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    QRegularExpression re("^-?[0-9A-Z]+(\\.[0-9A-Z]+)?$", QRegularExpression::CaseInsensitiveOption);
    if (!re.match(number).hasMatch()) {
        return false;
    }
    for (int i = (number[0] == '-' ? 1 : 0); i < number.length(); ++i) {
        QChar c = number[i].toUpper();
        if (c != '.' && (validChars.indexOf(c) >= base)) {
            return false;
        }
    }
    return true;
}

double MainWindow::convertToDecimal(const QString &number, int fromBase)
{
    bool negative = number.startsWith('-');
    QString absNumber = negative ? number.mid(1) : number;
    QStringList parts = absNumber.split('.');
    QString integerPart = parts[0];
    QString fractionalPart = parts.size() > 1 ? parts[1] : "";

    double result = 0.0;
    double intValue = 0.0;
    for (int i = 0; i < integerPart.length(); ++i) {
        intValue = intValue * fromBase + QString("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ").indexOf(integerPart[i].toUpper());
    }
    result += intValue;

    if (!fractionalPart.isEmpty()) {
        double fraction = 0.0;
        double multiplier = 1.0 / fromBase;
        for (int i = 0; i < fractionalPart.length(); ++i) {
            fraction += QString("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ").indexOf(fractionalPart[i].toUpper()) * multiplier;
            multiplier /= fromBase;
        }
        result += fraction;
    }

    return negative ? -result : result;
}

QString MainWindow::convertFromDecimal(double number, int toBase)
{
    bool negative = number < 0;
    number = qAbs(number);
    QString integerPart = "";
    long long intValue = static_cast<long long>(number);
    double fractionalValue = number - intValue;

    // Convert integer part
    do {
        int remainder = intValue % toBase;
        integerPart.prepend(QString("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")[remainder]);
        intValue /= toBase;
    } while (intValue > 0);

    // Convert fractional part
    QString fractionalPart = "";
    int precision = 10;  // You can adjust this for more or less precision
    for (int i = 0; i < precision && fractionalValue > 0; ++i) {
        fractionalValue *= toBase;
        int digit = static_cast<int>(fractionalValue);
        fractionalPart.append(QString("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")[digit]);
        fractionalValue -= digit;
    }

    // Combine parts
    QString result = integerPart;
    if (!fractionalPart.isEmpty()) {
        result += "." + fractionalPart;
    }

    return negative ? "-" + result : result;
}
