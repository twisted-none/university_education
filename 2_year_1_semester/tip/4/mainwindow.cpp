//тетрадь4
#include "mainwindow.h"
#include "./ui_mainwindow.h"
#include <QMessageBox>
#include <QDebug>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::on_registerButton_clicked()
{
    QString error;

        // Проверка имени пользователя
        QString username = ui->usernameEdit->text();
        if (!validateUsername(username, error)) {
            QMessageBox::warning(this, "Ошибка", error);
            return;
        }

        // Проверка ФИО
        QString lastName, firstName, middleName;
        QString fullName = ui->fullNameEdit->text();
        if (!validateFullName(fullName, lastName, firstName, middleName, error)) {
            QMessageBox::warning(this, "Ошибка", error);
            return;
        }

        // Получение пола
        QString gender = ui->maleRadio->isChecked() ? "мужской" : "женский";

        // Проверка паспорта
        QString passportSeries, passportNumber;
        QString passport = ui->passportEdit->text();
        if (!validatePassport(passport, passportSeries, passportNumber, error)) {
            QMessageBox::warning(this, "Ошибка", error);
            return;
        }

        // Проверка даты рождения
        QString day, month, year;
        QString birthDate = ui->birthDateEdit->text();
        if (!validateBirthDate(birthDate, day, month, year, error)) {
            QMessageBox::warning(this, "Ошибка", error);
            return;
        }

        // Проверка телефона
        QString formattedPhone;
        QString phone = ui->phoneEdit->text();
        if (!validatePhone(phone, formattedPhone, error)) {
            QMessageBox::warning(this, "Ошибка", error);
            return;
        }

        // Проверка email
        QString email = ui->emailEdit->text();
        if (!validateEmail(email, error)) {
            QMessageBox::warning(this, "Ошибка", error);
            return;
        }

        // Проверка Снилс
        QString formattedSnils;
            QString snils = ui->snilsEdit->text();
            if (!validateSnils(snils, formattedSnils, error)) {
                QMessageBox::warning(this, "Ошибка", error);
                return;
            }

        // Формирование сообщения об успешной регистрации
            QString message = QString("Вы успешно зарегистрировали аккаунт %1. "
                                        "Ваше имя: %2, ваша фамилия: %3, ваше отчество: %4. "
                                        "Ваш пол: %5. "
                                        "Серия Вашего паспорта: %6, номер: %7. "
                                        "Вы родились %8 %9 %10. "
                                        "Ваш номер телефона: %11. "
                                        "Ваш e-mail: %12. "
                                        "Ваш СНИЛС: %13. "
                                        "Спасибо за регистрацию!")
                                 .arg(username)
                                 .arg(firstName)
                                 .arg(lastName)
                                 .arg(middleName)
                                 .arg(gender)
                                 .arg(passportSeries)
                                 .arg(passportNumber)
                                 .arg(day)
                                 .arg(getMonthName(month.toInt()))
                                 .arg(year)
                                 .arg(formattedPhone)
                                 .arg(email)
                                 .arg(formattedSnils);

                QMessageBox::information(this, "Регистрация успешна", message);
            }

bool MainWindow::validateUsername(const QString &username, QString &error)
{
    if (username.isEmpty()) {
        error = "Имя пользователя не может быть пустым";
        return false;
    }

    if (username.length() > 15) {
        error = "Имя пользователя не может быть длиннее 15 символов";
        return false;
    }

    // Проверяем каждый символ на допустимость
    for (const QChar &ch : username) {
        // Проверяем, что символ это латинская буква или цифра
        if (!((ch >= 'A' && ch <= 'Z') ||
              (ch >= 'a' && ch <= 'z') ||
              (ch >= '0' && ch <= '9'))) {
            error = "Имя пользователя может содержать только латинские буквы и цифры";
            return false;
        }
    }

    return true;
}

bool MainWindow::validateFullName(const QString &fullName, QString &lastName, QString &firstName,
                                QString &middleName, QString &error)
{
    // Используем QString::SplitBehavior вместо Qt::SkipEmptyParts
    QStringList parts = fullName.split(' ', QString::SkipEmptyParts);

    if (parts.size() != 3) {
        error = "ФИО должно состоять из трех слов";
        return false;
    }

    lastName = parts[0];
    firstName = parts[1];
    middleName = parts[2];

    // Функция для проверки слова на кириллицу
    auto validateWord = [](const QString &word) -> bool {
        if (word.isEmpty() || word.length() > 15) return false;
        if (!word[0].isUpper()) return false;

        for (const QChar &ch : word) {
            // Проверка на кириллицу через диапазон Unicode
            if (!(ch.unicode() >= 0x0410 && ch.unicode() <= 0x044F) && ch.unicode() != 0x0401 && ch.unicode() != 0x0451) {
                return false;
            }
        }
        return true;
    };

    if (!validateWord(lastName)) {
        error = "Фамилия должна начинаться с заглавной буквы и содержать только русские буквы (не более 15 символов)";
        return false;
    }

    if (!validateWord(firstName)) {
        error = "Имя должно начинаться с заглавной буквы и содержать только русские буквы (не более 15 символов)";
        return false;
    }

    if (!validateWord(middleName)) {
        error = "Отчество должно начинаться с заглавной буквы и содержать только русские буквы (не более 15 символов)";
        return false;
    }

    return true;
}

bool MainWindow::validatePassport(const QString &passport, QString &series, QString &number, QString &error)
{
    QStringList parts = passport.split(" ", QString::SkipEmptyParts);

    if (parts.size() != 2) {
        error = "Паспортные данные должны состоять из серии и номера, разделенных пробелом";
        return false;
    }

    series = parts[0];
    number = parts[1];

    // Проверка серии
    if (series.length() != 4) {
        error = "Серия паспорта должна состоять из 4 цифр";
        return false;
    }
    for (const QChar &ch : series) {
        if (!ch.isDigit()) {
            error = "Серия паспорта должна состоять из цифр";
            return false;
        }
    }

    // Проверка номера
    if (number.length() != 6) {
        error = "Номер паспорта должен состоять из 6 цифр";
        return false;
    }
    for (const QChar &ch : number) {
        if (!ch.isDigit()) {
            error = "Номер паспорта должен состоять из цифр";
            return false;
        }
    }

    return true;
}

bool MainWindow::validateBirthDate(const QString &birthDate, QString &day, QString &month,
                                 QString &year, QString &error)
{
    if (!birthDate.contains(".")) {
        error = "Дата рождения должна быть в формате DD.MM.YYYY";
        return false;
    }

    QStringList parts = birthDate.split(".");
    if (parts.size() != 3) {
        error = "Дата рождения должна быть в формате DD.MM.YYYY (например, 01.08.2005)";
        return false;
    }

    day = parts[0];
    month = parts[1];
    year = parts[2];

    // Проверка формата чисел
    bool ok;
    int d = day.toInt(&ok);
    if (!ok || day.length() != 2 || d < 1 || d > 31) {
        error = "День должен быть двузначным числом от 01 до 31";
        return false;
    }

    int m = month.toInt(&ok);
    if (!ok || month.length() != 2 || m < 1 || m > 12) {
        error = "Месяц должен быть двузначным числом от 01 до 12";
        return false;
    }

    int y = year.toInt(&ok);
    if (!ok || year.length() != 4 || y < 1900 || y > 2024) {
        error = "Год должен быть четырехзначным числом от 1900 до 2024";
        return false;
    }

    // Проверка дней в месяце
    QVector<int> daysInMonth = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    if (y % 4 == 0 && (y % 100 != 0 || y % 400 == 0)) {
        daysInMonth[1] = 29; // Високосный год
    }

    if (d > daysInMonth[m - 1]) {
        error = "Указано некорректное количество дней для данного месяца";
        return false;
    }

    return true;
}

bool MainWindow::validatePhone(const QString &phone, QString &formattedPhone, QString &error)
{
    // Удаляем все пробелы из номера
    QString cleanPhone = phone.trimmed();

    // Проверяем начало номера
    if (!cleanPhone.startsWith("+7") && !cleanPhone.startsWith("8")) {
        error = "Телефон должен начинаться с +7 или 8";
        return false;
    }

    // Определяем позицию начала основного номера
    int startPos = cleanPhone.startsWith("+7") ? 3 : 2;

    // Получаем основную часть номера после +7 или 8
    QString mainPart = cleanPhone.mid(startPos);

    // Разделяем на части по дефису
    QStringList parts = mainPart.split("-");
    if (parts.size() != 4) {
        error = "Телефон должен быть в формате +7-XXX-XXX-XX-XX или 8-XXX-XXX-XX-XX";
        return false;
    }

    // Проверка длины каждой части
    if (parts[0].length() != 3 || parts[1].length() != 3 ||
        parts[2].length() != 2 || parts[3].length() != 2) {
        error = "Неверный формат номера телефона";
        return false;
    }

    // Проверка, что все символы - цифры
    QString allDigits = parts.join("");
    for (const QChar &ch : allDigits) {
        if (!ch.isDigit()) {
            error = "Номер телефона должен содержать только цифры";
            return false;
        }
    }

    // Всегда приводим к формату, начинающемуся с 8
    formattedPhone = "8" + allDigits;
    return true;
}

bool MainWindow::validateEmail(const QString &email, QString &error)
{
    if (email.isEmpty()) {
        error = "Email не может быть пустым";
        return false;
    }

    if (email.length() > 30) {
        error = "Email не может быть длиннее 30 символов";
        return false;
    }

    if (!email.contains("@")) {
        error = "Email должен содержать символ @";
        return false;
    }

    QStringList parts = email.split("@");
    if (parts.size() != 2) {
        error = "Некорректный формат email";
        return false;
    }

    QString localPart = parts[0];
    QString domain = parts[1];

    if (localPart.isEmpty() || domain.isEmpty()) {
        error = "Некорректный формат email";
        return false;
    }

    if (!domain.contains(".")) {
        error = "Домен должен содержать точку";
        return false;
    }

    QStringList domainParts = domain.split(".");
    if (domainParts.last().length() < 2) {
        error = "Домен верхнего уровня должен содержать минимум 2 символа";
        return false;
    }

    // Проверка допустимых символов
    for (const QChar &ch : email) {
        if (!ch.isLetterOrNumber() && ch != '@' && ch != '.' && ch != '_' && ch != '-' && ch != '+') {
            error = "Email содержит недопустимые символы";
            return false;
        }
    }

    return true;
}

bool MainWindow::validateSnils(const QString &snils, QString &formattedSnils, QString &error)
{
    if (snils.length() != 14) {
        error = "СНИЛС должен быть в формате XXX-XXX-XXX XX";
        return false;
    }

    // Проверка дефисов и пробела
    if (snils[3] != '-' || snils[7] != '-' || snils[11] != ' ') {
        error = "СНИЛС должен быть в формате XXX-XXX-XXX XX";
        return false;
    }

    QString cleanSnils;
    for (int i = 0; i < snils.length(); ++i) {
        if (i != 3 && i != 7 && i != 11) {
            if (!snils[i].isDigit()) {
                error = "СНИЛС должен содержать только цифры";
                return false;
            }
            cleanSnils += snils[i];
        }
    }

    if (cleanSnils.length() != 11) {
        error = "СНИЛС должен состоять из 11 цифр";
        return false;
    }

    formattedSnils = snils;

    return true;
}

QString MainWindow::getMonthName(int month)
{
    QVector<QString> months = {
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    };
    if (month > 0 && month <= 12) {
        return months[month - 1];
    }
    return "неизвестный месяц";
}
