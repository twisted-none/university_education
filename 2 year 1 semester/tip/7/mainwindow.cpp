#include "mainwindow.h"
#include <QVBoxLayout>
#include <QLabel>
#include <QDate>
#include <QMessageBox>
#include <QRegularExpression>
#include <QFileDialog>
#include <QFile>
#include <QTextStream>


MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    QWidget *centralWidget = new QWidget(this);
    QVBoxLayout *layout = new QVBoxLayout(centralWidget);

    usernameEdit = new QLineEdit(this);
    fullNameEdit = new QLineEdit(this);
    maleRadio = new QRadioButton("Мужской", this);
    femaleRadio = new QRadioButton("Женский", this);
    passportEdit = new QLineEdit(this);
    birthDateEdit = new QLineEdit(this);
    phoneEdit = new QLineEdit(this);
    emailEdit = new QLineEdit(this);
    snilsEdit = new QLineEdit(this);
    registerButton = new QPushButton("Регистрация", this);
    saveButton = new QPushButton("Сохранить в файл", this);
    openButton = new QPushButton("Загрузить из файла", this);

    layout->addWidget(new QLabel("Имя пользователя:"));
    layout->addWidget(usernameEdit);
    layout->addWidget(new QLabel("ФИО:"));
    layout->addWidget(fullNameEdit);
    layout->addWidget(new QLabel("Пол:"));
    layout->addWidget(maleRadio);
    layout->addWidget(femaleRadio);
    layout->addWidget(new QLabel("Паспорт:"));
    layout->addWidget(passportEdit);
    layout->addWidget(new QLabel("Дата рождения:"));
    layout->addWidget(birthDateEdit);
    layout->addWidget(new QLabel("Телефон:"));
    layout->addWidget(phoneEdit);
    layout->addWidget(new QLabel("E-mail:"));
    layout->addWidget(emailEdit);
    layout->addWidget(new QLabel("СНИЛС:"));
    layout->addWidget(snilsEdit);
    layout->addWidget(registerButton);
    layout->addWidget(saveButton);
    layout->addWidget(openButton);


    centralWidget->setLayout(layout);
    setCentralWidget(centralWidget);


    connect(registerButton, &QPushButton::clicked, this, &MainWindow::onRegisterClicked);
    connect(saveButton, &QPushButton::clicked, this, &MainWindow::onSaveFileClicked);
    connect(openButton, &QPushButton::clicked, this, &MainWindow::onOpenFileClicked);
}

MainWindow::~MainWindow()
{
}

void MainWindow::onRegisterClicked()
{
    if (validateInputs()) {
        QString message = QString("Вы успешно зарегистрировали аккаунт %1. ")
                          .arg(usernameEdit->text());

        QStringList names = fullNameEdit->text().split(" ", QString::SkipEmptyParts);
        if (names.size() >= 3) {
            message += QString("Ваше имя: %1, ваша фамилия: %2, ваше отчество: %3. ")
                       .arg(names[1], names[0], names[2]);
        }

        message += QString("Ваш пол: %1. ")
                   .arg(maleRadio->isChecked() ? "Мужской" : "Женский");

        QStringList passport = passportEdit->text().split(" ");
        if (passport.size() == 2) {
            message += QString("Серия Вашего паспорта: %1, номер: %2. ")
                       .arg(passport[0], passport[1]);
        }

        QDate birthDate = QDate::fromString(birthDateEdit->text(), "dd.MM.yyyy");
        message += QString("Вы родились %1 %2 %3. ")
                   .arg(birthDate.day())
                   .arg(birthDate.toString("MMMM"))
                   .arg(birthDate.year());

        message += QString("Ваш номер телефона: %1. ")
                   .arg(phoneEdit->text().remove(0, 1).remove("-"));

        message += QString("Ваш e-mail: %1. ")
                   .arg(emailEdit->text());

        message += QString("Ваш СНИЛС: %1. Спасибо за регистрацию!").arg(snilsEdit->text());

        QMessageBox::information(this, "Регистрация", message);
    }
}
void MainWindow::onSaveFileClicked()
{
    if (!validateInputs()) {
        return;
    }

    QString fileName = QFileDialog::getSaveFileName(this, "Сохранить данные", "", "Binary Files (*.bin)");
    if (fileName.isEmpty()) {
        QMessageBox::warning(this, "Ошибка", "Вы не выбрали файл!");
        return;
    }

    QFile file(fileName);
    if (!file.open(QIODevice::WriteOnly)) {
        QMessageBox::warning(this, "Ошибка", "Не удалось открыть файл для записи!");
        return;
    }

    QDataStream ds(&file);

    // Записываем данные в бинарный поток
    ds << usernameEdit->text();
    ds << fullNameEdit->text();
    ds << (maleRadio->isChecked() ? "M" : "F");
    ds << passportEdit->text();
    ds << birthDateEdit->text();
    ds << phoneEdit->text();
    ds << emailEdit->text();
    ds << snilsEdit->text();

    file.close();
    QMessageBox::information(this, "Успех", "Данные успешно сохранены в бинарный файл!");
}
void MainWindow::onOpenFileClicked()
{
    QString fileName = QFileDialog::getOpenFileName(this, "Открыть файл", "", "Binary Files (*.bin)");
    if (fileName.isEmpty()) {
        QMessageBox::warning(this, "Ошибка", "Вы не выбрали файл!");
        return;
    }

    QFile file(fileName);
    if (!file.open(QIODevice::ReadOnly)) {
        QMessageBox::warning(this, "Ошибка", "Не удалось открыть файл для чтения!");
        return;
    }

    QDataStream ds(&file);

    // Считываем данные из бинарного потока
    QString username, fullName, gender, passport, birthDate, phone, email, snils;
    ds >> username;
    ds >> fullName;
    ds >> gender;
    ds >> passport;
    ds >> birthDate;
    ds >> phone;
    ds >> email;
    ds >> snils;

    // Проверяем корректность данных
    QStringList errorMessages;
    if (!validateUsername(username) ||
        !validateFullName(fullName, errorMessages) ||
        !validatePassport(passport) ||
        !validateBirthDate(birthDate) ||
        !validatePhone(phone) ||
        !validateEmail(email) ||
        !validateSnils(snils)) {
        QString errorMessage = "Данные в файле повреждены или отредактированы:\n";
        errorMessage += errorMessages.join("\n");
        QMessageBox::warning(this, "Ошибка", errorMessage);
        file.close();
        return;
    }

    // Заполняем поля формы
    usernameEdit->setText(username);
    fullNameEdit->setText(fullName);
    if (gender == "M") {
        maleRadio->setChecked(true);
        femaleRadio->setChecked(false);  // Явно снимаем выделение с женского пола
    } else if (gender == "F") {
        femaleRadio->setChecked(true);
        maleRadio->setChecked(false);    // Явно снимаем выделение с мужского пола
    }
    passportEdit->setText(passport);
    birthDateEdit->setText(birthDate);
    phoneEdit->setText(phone);
    emailEdit->setText(email);
    snilsEdit->setText(snils);

    file.close();
    QMessageBox::information(this, "Успех", "Данные успешно загружены из бинарного файла!");
}
bool MainWindow::validateInputs()
{
    QStringList errorMessages;

    if (!validateUsername(usernameEdit->text())) {
        errorMessages.append("Некорректное имя пользователя");
    }
    if (!validateFullName(fullNameEdit->text(), errorMessages)) {

    }
    if (!validatePassport(passportEdit->text())) {
        errorMessages.append("Некорректный паспорт");
    }
    if (!validateBirthDate(birthDateEdit->text())) {
        errorMessages.append("Некорректная дата рождения");
    }
    if (!validatePhone(phoneEdit->text())) {
        errorMessages.append("Некорректный номер телефона");
    }
    if (!validateEmail(emailEdit->text())) {
        errorMessages.append("Некорректный email");
    }
    if (!validateSnils(snilsEdit->text())) {
        errorMessages.append("Некорректный СНИЛС");
    }

    if (!errorMessages.isEmpty()) {
        QMessageBox::warning(this, "Ошибка", errorMessages.join("\n"));
        return false;
    }

    return true;
}

bool MainWindow::isLeapYear(int year)
{
    return (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
}

bool MainWindow::validateUsername(const QString &username)
{
    if (username.isEmpty()) {
        return false;
    }

    if (username.length() > 15) {
        return false;
    }

    for (const QChar &ch : username) {
        if (!(ch.isLetter() && ch.unicode() < 128) && !ch.isDigit()) {
            return false;
        }
    }
    return true;
}

bool MainWindow::validateFullName(const QString &fullName, QStringList &errorMessages)
{
    QStringList names = fullName.split(" ", QString::SkipEmptyParts);

    if (names.size() != 3) {
        errorMessages.append("ФИО должно состоять из трех слов");
        return false;
    }

    // Проверка фамилии
    QString surname = names[0];
    if (surname.length() > 15) {
        errorMessages.append("Фамилия не должна превышать 15 символов");
        return false;
    }
    if (!surname[0].isUpper()) {
        errorMessages.append("Фамилия должна начинаться с заглавной буквы");
        return false;
    }
    // Проверка на наличие второй заглавной буквы
    for (int i = 1; i < surname.length(); ++i) {
        if (surname[i].isUpper()) {
            errorMessages.append("В фамилии не может быть второй заглавной буквы");
            return false;
        }
    }
    // Проверка на кириллицу
    for (const QChar &ch : surname) {
        if (!(ch.unicode() >= 0x0410 && ch.unicode() <= 0x044F)) {
            errorMessages.append("Фамилия должна содержать только русские буквы");
            return false;
        }
    }

    // Проверка имени
    QString firstName = names[1];
    if (firstName.length() > 15) {
        errorMessages.append("Имя не должно превышать 15 символов");
        return false;
    }
    if (!firstName[0].isUpper()) {
        errorMessages.append("Имя должно начинаться с заглавной буквы");
        return false;
    }
    // Проверка на наличие второй заглавной буквы
    for (int i = 1; i < firstName.length(); ++i) {
        if (firstName[i].isUpper()) {
            errorMessages.append("В имени не может быть второй заглавной буквы");
            return false;
        }
    }
    // Проверка на кириллицу
    for (const QChar &ch : firstName) {
        if (!(ch.unicode() >= 0x0410 && ch.unicode() <= 0x044F)) {
            errorMessages.append("Имя должно содержать только русские буквы");
            return false;
        }
    }

    // Проверка отчества
    QString patronymic = names[2];
    if (patronymic.length() > 15) {
        errorMessages.append("Отчество не должно превышать 15 символов");
        return false;
    }
    if (!patronymic[0].isUpper()) {
        errorMessages.append("Отчество должно начинаться с заглавной буквы");
        return false;
    }
    // Проверка на наличие второй заглавной буквы
    for (int i = 1; i < patronymic.length(); ++i) {
        if (patronymic[i].isUpper()) {
            errorMessages.append("В отчестве не может быть второй заглавной буквы");
            return false;
        }
    }
    // Проверка на кириллицу
    for (const QChar &ch : patronymic) {
        if (!(ch.unicode() >= 0x0410 && ch.unicode() <= 0x044F)) {
            errorMessages.append("Отчество должно содержать только русские буквы");
            return false;
        }
    }

    // Проверка окончания отчества в зависимости от пола
    if (maleRadio->isChecked()) {
        if (!patronymic.endsWith("вич")) {
            errorMessages.append("Для мужского пола отчество должно заканчиваться на \"-вич\"");
            return false;
        }
    } else {
        if (!patronymic.endsWith("на")) {
            errorMessages.append("Для женского пола отчество должно заканчиваться на \"-на\"");
            return false;
        }
    }

    return true;
}

bool MainWindow::validatePassport(const QString &passport)
{
    QStringList parts = passport.split(" ", QString::SkipEmptyParts);

    if (parts.size() != 2) {
        return false;
    }

    QString series = parts[0];
    QString number = parts[1];

    if (series.length() != 4 || number.length() != 6) {
        return false;
    }

    for (const QChar &ch : series) {
        if (!ch.isDigit()) {
            return false;
        }
    }

    for (const QChar &ch : number) {
        if (!ch.isDigit()) {
            return false;
        }
    }

    return true;
}

bool MainWindow::validateBirthDate(const QString &birthDate)
{
    if (!birthDate.contains(".")) {
        return false;
    }

    QStringList parts = birthDate.split(".");
    if (parts.size() != 3) {
        return false;
    }

    QString day = parts[0];
    QString month = parts[1];
    QString year = parts[2];

    // Проверка формата дд.мм.гггг
    if (day.length() != 2 || month.length() != 2 || year.length() != 4) {
        return false;
    }

    // Проверка что все символы - цифры
    for (const QString &part : parts) {
        for (const QChar &ch : part) {
            if (!ch.isDigit()) {
                return false;
            }
        }
    }

    int dayNum = day.toInt();
    int monthNum = month.toInt();
    int yearNum = year.toInt();

    // Проверка корректности месяца
    if (monthNum < 1 || monthNum > 12) {
        return false;
    }

    // Проверка корректности дня
    int daysInMonth[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    if (isLeapYear(yearNum)) {
        daysInMonth[1] = 29;
    }

    if (dayNum < 1 || dayNum > daysInMonth[monthNum - 1]) {
        return false;
    }

    return true;
}

bool MainWindow::validatePhone(const QString &phone)
{
    // Проверяем начинается ли с +7-
    if (!phone.startsWith("+7-") && !phone.startsWith("8")) {
        return false;
    }

    // Разбиваем строку по дефису
    QStringList parts = phone.split("-");

    // Должно быть 5 частей: +7, XXX, XXX, XX, XX
    if (parts.size() != 5) {
        return false;
    }

    // Проверяем длины частей (первая часть "+7" уже проверена)
    if (parts[1].length() != 3 || // первая группа цифр
        parts[2].length() != 3 || // вторая группа цифр
        parts[3].length() != 2 || // третья группа цифр
        parts[4].length() != 2)   // четвертая группа цифр
    {
        return false;
    }

    // Проверяем что все символы в группах - цифры
    for (int i = 1; i < parts.size(); ++i) {
        for (const QChar &ch : parts[i]) {
            if (!ch.isDigit()) {
                return false;
            }
        }
    }

    return true;
}


bool MainWindow::validateEmail(const QString &email)
{
    if (email.length() > 20) {
        return false;
    }

    if (!email.contains("@") || !email.contains(".")) {
        return false;
    }

    QStringList parts = email.split("@");
    if (parts.size() != 2) {
        return false;
    }

    QString localPart = parts[0];
    QString domain = parts[1];

    if (localPart.isEmpty() || domain.isEmpty()) {
        return false;
    }

    // Проверка локальной части
    for (const QChar &ch : localPart) {
        if (!ch.isLetterOrNumber() && ch != '.' && ch != '_' && ch != '-') {
            return false;
        }
    }

    // Проверка домена
    QStringList domainParts = domain.split(".");
    if (domainParts.size() < 2) {
        return false;
    }

    for (const QString &part : domainParts) {
        if (part.isEmpty()) {
            return false;
        }
        for (const QChar &ch : part) {
            if (!ch.isLetterOrNumber() && ch != '-') {
                return false;
            }
        }
    }

    return true;
}

bool MainWindow::validateSnils(const QString &snils)
{
    // Проверяем длину строки
    if (snils.length() != 14) {  // XXX-XXX-XXX XX (11 цифр + 3 разделителя)
        return false;
    }

    // Проверяем формат с использованием методов QString
    QStringList mainParts = snils.split(" ");
    if (mainParts.size() != 2) {  // Должно быть две части: XXX-XXX-XXX и XX
        return false;
    }

    // Проверяем первую часть (XXX-XXX-XXX)
    QString firstPart = mainParts[0];
    QStringList numbers = firstPart.split("-");
    if (numbers.size() != 3) {  // Должно быть три группы по 3 цифры
        return false;
    }

    // Проверяем каждую группу цифр
    for (const QString &group : numbers) {
        if (group.length() != 3) {  // Каждая группа должна состоять из 3 цифр
            return false;
        }
        for (const QChar &ch : group) {
            if (!ch.isDigit()) {  // Проверяем, что все символы - цифры
                return false;
            }
        }
    }

    // Проверяем контрольное число (XX)
    QString checkSum = mainParts[1];
    if (checkSum.length() != 2) {  // Контрольное число должно состоять из 2 цифр
        return false;
    }
    for (const QChar &ch : checkSum) {
        if (!ch.isDigit()) {
            return false;
        }
    }

    return true;
}
