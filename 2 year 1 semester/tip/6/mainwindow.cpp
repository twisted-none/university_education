//тетрадь6
#include "mainwindow.h"
#include "./ui_mainwindow.h"
#include <QMessageBox>
#include <QRegularExpression>
#include <QDebug>
#include <QFile>
#include <QTextStream>
#include <QFileDialog>
#include <QCryptographicHash>

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


            QString fileName = QFileDialog::getSaveFileName(this, "Сохранить данные", "", "Текстовый файл (*.txt)");
            if (fileName.isEmpty()) { return; }

            QFile file(fileName);
            if (!file.open(QIODevice::WriteOnly | QIODevice::Text)) {
                QMessageBox::warning(this, "Ошибка", "Не удалось сохранить файл");
                return;
            }

            QTextStream out(&file);
            out.setCodec("UTF-8");

            QString dataToHash = username + fullName + gender + passport + birthDate + phone + email + snils;
            QByteArray checksum = QCryptographicHash::hash(dataToHash.toUtf8(), QCryptographicHash::Sha256).toHex();

            out << "Username: " << username << "\n";
            out << "FullName: " << fullName << "\n"; // Store full name as entered
            out << "Gender: " << gender << "\n";
            out << "Passport: " << passport << "\n"; // Store full passport as entered
            out << "BirthDate: " << birthDate << "\n";
            out << "Phone: " << phone << "\n";
            out << "Email: " << email << "\n";
            out << "Snils: " << snils << "\n";
            out << "Checksum: " << checksum << "\n";


            file.close();
            QMessageBox::information(this, "Успех", "Данные успешно сохранены в файл");
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

    QRegularExpression regex("^[a-zA-Z0-9]+$");
    if (!regex.match(username).hasMatch()) {
        error = "Имя пользователя может содержать только латинские буквы и цифры";
        return false;
    }

    return true;
}

bool MainWindow::validateFullName(const QString &fullName, QString &lastName, QString &firstName,
                                QString &middleName, QString &error)
{
    QStringList parts = fullName.split(" ");
    parts.removeAll("");  // Удаляем пустые строки вместо использования SkipEmptyParts

    if (parts.size() != 3) {
        error = "ФИО должно состоять из трех слов";
        return false;
    }

    lastName = parts[0];
    firstName = parts[1];
    middleName = parts[2];

    QRegularExpression regex("^[А-ЯЁ][а-яё]+$");

    if (!regex.match(lastName).hasMatch() || lastName.length() > 15) {
        error = "Фамилия должна начинаться с заглавной буквы, с последующими строчными буквами, и содержать только русские буквы (не более 15 символов)";
        return false;
    }

    if (!regex.match(firstName).hasMatch() || firstName.length() > 15) {
        error = "Имя должно начинаться с заглавной буквы, с последующими строчными буквами, и содержать только русские буквы (не более 15 символов)";
        return false;
    }

    if (!regex.match(middleName).hasMatch() || middleName.length() > 15) {
        error = "Отчество должно начинаться с заглавной буквы, с последующими строчными буквами, и содержать только русские буквы (не более 15 символов)";
        return false;
    }

    return true;
}

bool MainWindow::validatePassport(const QString &passport, QString &series, QString &number, QString &error)
{
    QStringList parts = passport.split(" ");
    parts.removeAll("");  // Удаляем пустые строки вместо использования SkipEmptyParts

    if (parts.size() != 2) {
        error = "Паспортные данные должны состоять из серии и номера, разделенных пробелом";
        return false;
    }

    series = parts[0];
    number = parts[1];

    QRegularExpression seriesRegex("^\\d{4}$");
    QRegularExpression numberRegex("^\\d{6}$");

    if (!seriesRegex.match(series).hasMatch()) {
        error = "Серия паспорта должна состоять из 4 цифр";
        return false;
    }

    if (!numberRegex.match(number).hasMatch()) {
        error = "Номер паспорта должен состоять из 6 цифр";
        return false;
    }

    return true;
}

bool MainWindow::validateBirthDate(const QString &birthDate, QString &day, QString &month,
                                 QString &year, QString &error)
{
    QRegularExpression regex("^(0[1-9]|[12][0-9]|3[01])\\.(0[1-9]|1[0-2])\\.(19|20)\\d{2}$");
    if (!regex.match(birthDate).hasMatch()) {
        error = "Дата рождения должна быть в формате DD.MM.YYYY (например, 01.08.2005)";
        return false;
    }

    QStringList parts = birthDate.split(".");
    day = parts[0];
    month = parts[1];
    year = parts[2];

    // Дополнительная проверка валидности даты
    int d = day.toInt();
    int m = month.toInt();
    int y = year.toInt();

    if (y < 1900 || y > 2024) {
        error = "Указан некорректный год";
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
    // Регулярное выражение для форматов +7-XXX-XXX-XX-XX и 8-XXX-XXX-XX-XX
    QRegularExpression regex("^(\\+7|8)-\\d{3}-\\d{3}-\\d{2}-\\d{2}$");

    if (!regex.match(phone).hasMatch()) {
        error = "Телефон должен быть в формате +7-XXX-XXX-XX-XX или 8-XXX-XXX-XX-XX";
        return false;
    }

    // Преобразование в формат без пробелов, начинающийся с 8
    if (phone.startsWith("+7")) {
        formattedPhone = "8" + phone.mid(2).replace("-", "");
    } else {
        formattedPhone = "8" + phone.mid(1).replace("-", "");
    }

    return true;
}

bool MainWindow::validateEmail(const QString &email, QString &error)
{
    if (email.isEmpty()) {
        error = "Email не может быть пустым";
        return false;
    }

    if (email.length() > 20) {
        error = "Email не может быть длиннее 20 символов";
        return false;
    }

    // Проверка формата email через регулярное выражение
    QRegularExpression regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    if (!regex.match(email).hasMatch()) {
        error = "Некорректный формат email";
        return false;
    }

    return true;
}

bool MainWindow::validateSnils(const QString &snils, QString &formattedSnils, QString &error)
{
    // Регулярное выражение для проверки формата XXX-XXX-XXX XX
    QRegularExpression regex("^\\d{3}-\\d{3}-\\d{3} \\d{2}$");
    if (!regex.match(snils).hasMatch()) {
        error = "СНИЛС должен быть в формате XXX-XXX-XXX XX";
        return false;
    }

    // Удаляем все пробелы и дефисы для проверки контрольной суммы
    QString cleanSnils = snils.simplified().remove(" ").remove("-");

    // Проверяем, что СНИЛС состоит из 11 цифр (дублирование проверки, но на всякий случай)
    if (cleanSnils.length() != 11) {
        error = "СНИЛС должен состоять из 11 цифр";
        return false;
    }


    formattedSnils = snils; // Если формат верный, просто копируем

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

void MainWindow::on_loadButton_clicked()
{
    QString fileName = QFileDialog::getOpenFileName(this, "Открыть файл", "", "Текстовый файл (*.txt)");
    if (fileName.isEmpty()) { return; }

    QFile file(fileName);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        QMessageBox::warning(this, "Ошибка", "Не удалось открыть файл");
        return;
    }

    QTextStream in(&file);
    in.setCodec("UTF-8");
    QString error;


    QString username = in.readLine().section(": ", 1);
    QString fullName = in.readLine().section(": ", 1);
    QString gender = in.readLine().section(": ", 1);
    QString passport = in.readLine().section(": ", 1);
    QString birthDate = in.readLine().section(": ", 1);
    QString phone = in.readLine().section(": ", 1);
    QString email = in.readLine().section(": ", 1);
    QString snils = in.readLine().section(": ", 1);
    QString storedChecksum = in.readLine().section(": ", 1);


    QString dataToHash = username + fullName + gender + passport + birthDate + phone + email + snils;
    QByteArray calculatedChecksum = QCryptographicHash::hash(dataToHash.toUtf8(), QCryptographicHash::Sha256).toHex();

    if (calculatedChecksum != storedChecksum) {
        QMessageBox::warning(this, "Ошибка", "Контрольная сумма файла не совпадает. Данные могли быть изменены.");
        file.close();
        return;
    }


    // Validation can be added here if needed before setting the UI elements

    ui->usernameEdit->setText(username);
    ui->fullNameEdit->setText(fullName);
    ui->maleRadio->setChecked(gender == "мужской");
    ui->femaleRadio->setChecked(gender == "женский");
    ui->passportEdit->setText(passport);
    ui->birthDateEdit->setText(birthDate);
    ui->phoneEdit->setText(phone);
    ui->emailEdit->setText(email);
    ui->snilsEdit->setText(snils);

    file.close();
    QMessageBox::information(this, "Успех", "Данные успешно загружены из файла");

}


void MainWindow::showWarning(const QString& message) {
    QMessageBox::warning(this, "Ошибка", message);
}
