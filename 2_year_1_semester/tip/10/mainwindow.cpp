#include "mainwindow.h"
#include "./ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
        , ui(new Ui::MainWindow)
        , lastId(0)
    {
        ui->setupUi(this);

    // Инициализация таблицы
    ui->tableWidget->setColumnCount(COLUMN_COUNT);
    ui->tableWidget->setRowCount(5);
    ui->tableWidget->setHorizontalHeaderLabels(COLUMN_HEADERS);

    // Настройка ComboBox для сортировки
    ui->sortColumnBox->addItems(COLUMN_HEADERS);

    // Настройка ComboBox для поиска
    ui->searchColumnBox->addItems(COLUMN_HEADERS);

    // Настройка ComboBox для удаления дубликатов
    ui->duplicatesColumnBox->addItems(COLUMN_HEADERS);

    // Подключение к базовым слотам
    connect(ui->sortButton, &QPushButton::clicked, this, &MainWindow::on_sortButton_clicked);
    connect(ui->saveJsonButton, &QPushButton::clicked, this, &MainWindow::on_saveJsonButton_clicked);
    connect(ui->loadJsonButton, &QPushButton::clicked, this, &MainWindow::on_loadJsonButton_clicked);
    connect(ui->tableWidget, &QTableWidget::cellChanged,
               this, &MainWindow::on_tableWidget_cellChanged);
}

MainWindow::~MainWindow()
{
    delete ui;
}

bool MainWindow::isInteger(const QString &str)
{
    bool ok;
    str.toInt(&ok);
    return ok;
}

bool MainWindow::validateEmail(const QString &email)
{
    QRegularExpression emailRegex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    return emailRegex.match(email).hasMatch();
}

bool MainWindow::validatePhone(const QString &phone)
{
    QRegularExpression phoneRegex("^\\+7\\d{10}$");
    return phoneRegex.match(phone).hasMatch();
}

bool MainWindow::validateName(const QString &name)
{
    // Пустую строку считаем валидной
    if(name.isEmpty()) return true;

    // Для непустой строки проверяем правила:
    // 1. Первая буква должна быть заглавной
    // 2. Остальные буквы должны быть строчными (или дефис)
    return name[0].isUpper() && std::all_of(name.begin() + 1, name.end(),
                                           [](QChar c){ return c.isLower() || c == '-'; });
}

int MainWindow::calculatePhoneSum(const QString &phone)
{
    int sum = 0;
    for(QChar c : phone) {
        if(c.isDigit()) {
            sum += c.digitValue();
        }
    }
    return sum;
}

QString MainWindow::generateRandomName()
{
    static const QStringList names = {"Александр", "Михаил", "Иван", "Дмитрий", "Андрей"};
    return names[QRandomGenerator::global()->bounded(names.size())];
}

QString MainWindow::generateRandomSurname()
{
    static const QStringList surnames = {"Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов"};
    return surnames[QRandomGenerator::global()->bounded(surnames.size())];
}

QString MainWindow::generateRandomPatronymic()
{
    static const QStringList patronymics = {"Александрович", "Михайлович", "Иванович", "Дмитриевич"};
    return patronymics[QRandomGenerator::global()->bounded(patronymics.size())];
}

QString MainWindow::generateRandomPhone()
{
    QString phone = "+7";
    for(int i = 0; i < 10; ++i) {
        phone += QString::number(QRandomGenerator::global()->bounded(10));
    }
    return phone;
}

QString MainWindow::generateRandomEmail()
{
    static const QStringList domains = {"gmail.com", "yandex.ru", "mail.ru", "outlook.com"};
    QString name = generateRandomName().toLower();
    QString domain = domains[QRandomGenerator::global()->bounded(domains.size())];
    return name + QString::number(QRandomGenerator::global()->bounded(100)) + "@" + domain;
}

void MainWindow::preserveTableData(int newRows)
{
    QList<QStringList> data;
    int currentRows = ui->tableWidget->rowCount();

    // Сохраняем текущие данные
    for(int i = 0; i < currentRows; i++) {
        QStringList rowData;
        for(int j = 0; j < COLUMN_COUNT; j++) {
            QTableWidgetItem *item = ui->tableWidget->item(i, j);
            rowData << (item ? item->text() : "");
        }
        data.append(rowData);
    }

    // Устанавливаем новое количество строк
    ui->tableWidget->setRowCount(newRows);

    // Восстанавливаем данные
    for(int i = 0; i < qMin(newRows, data.size()); i++) {
        for(int j = 0; j < COLUMN_COUNT; j++) {
            QTableWidgetItem *item = ui->tableWidget->item(i, j);
            if(!item) {
                item = new QTableWidgetItem();
                ui->tableWidget->setItem(i, j, item);
            }
            item->setText(data[i][j]);
        }
    }

    // Инициализируем новые ячейки
    for(int i = data.size(); i < newRows; i++) {
        for(int j = 0; j < COLUMN_COUNT; j++) {
            QTableWidgetItem *item = new QTableWidgetItem();
            ui->tableWidget->setItem(i, j, item);
        }
    }
}

void MainWindow::updateIdColumn()
{
    int rows = ui->tableWidget->rowCount();
    for(int i = 0; i < rows; i++) {
        QTableWidgetItem *item = ui->tableWidget->item(i, 0);
        if(!item) {
            item = new QTableWidgetItem();
            ui->tableWidget->setItem(i, 0, item);
        }
        item->setText(QString::number(++lastId));
    }
}

// Слоты обработки нажатий кнопок

void MainWindow::on_setRowsButton_clicked()
{
    int newRows = ui->rowsSpinBox->value();
    if(newRows <= 0) {
        QMessageBox::warning(this, "Ошибка", "Количество строк должно быть положительным числом!");
        return;
    }
    preserveTableData(newRows);
}

void MainWindow::on_randomFillButton_clicked()
{
    int rows = ui->tableWidget->rowCount();

    for(int i = 0; i < rows; i++) {
        QString surname = generateRandomSurname();
        QString name = generateRandomName();
        QString patronymic = generateRandomPatronymic();

        // Проверка корректности имени, фамилии и отчества
        if (!validateName(surname) || !validateName(name) || !validateName(patronymic)) {
            QMessageBox::warning(this, "Ошибка",
                QString("Ошибка в строке %1: Имя, фамилия и отчество должны начинаться с заглавной буквы, "
                       "а остальные буквы должны быть строчными").arg(i + 1));
            return;
        }

        // ID генерируется автоматически
        QTableWidgetItem *idItem = new QTableWidgetItem(QString::number(++lastId));
        ui->tableWidget->setItem(i, 0, idItem);

        // Установка проверенных данных
        ui->tableWidget->setItem(i, 1, new QTableWidgetItem(surname));
        ui->tableWidget->setItem(i, 2, new QTableWidgetItem(name));
        ui->tableWidget->setItem(i, 3, new QTableWidgetItem(patronymic));
        ui->tableWidget->setItem(i, 4, new QTableWidgetItem(generateRandomPhone()));
        ui->tableWidget->setItem(i, 5, new QTableWidgetItem(generateRandomEmail()));
    }
}

void MainWindow::on_calculateButton_clicked()
{
    int rows = ui->tableWidget->rowCount();
    QList<int> phoneSums;
    QList<int> rowNumbers;

    // Собираем суммы цифр телефонов
    for(int i = 0; i < rows; i++) {
        QTableWidgetItem *item = ui->tableWidget->item(i, 4); // Столбец с телефоном
        if(!item || item->text().isEmpty()) {
            QMessageBox::warning(this, "Ошибка", "Обнаружены пустые ячейки!");
            return;
        }

        if(!validatePhone(item->text())) {
            QMessageBox::warning(this, "Ошибка",
                               QString("Некорректный номер телефона в строке %1").arg(i + 1));
            return;
        }

        int sum = calculatePhoneSum(item->text());
        phoneSums.append(sum);
        rowNumbers.append(i + 1);
    }

    if(phoneSums.isEmpty()) {
        QMessageBox::warning(this, "Ошибка", "Таблица пуста!");
        return;
    }

    // Находим минимум и максимум
    int minSum = *std::min_element(phoneSums.begin(), phoneSums.end());
    int maxSum = *std::max_element(phoneSums.begin(), phoneSums.end());
    double avgSum = std::accumulate(phoneSums.begin(), phoneSums.end(), 0.0) / phoneSums.size();

    // Формируем строки с номерами строк для минимума и максимума
    QString minRows, maxRows;
    for(int i = 0; i < phoneSums.size(); i++) {
        if(phoneSums[i] == minSum) {
            if(!minRows.isEmpty()) minRows += ", ";
            minRows += QString::number(rowNumbers[i]);
        }
        if(phoneSums[i] == maxSum) {
            if(!maxRows.isEmpty()) maxRows += ", ";
            maxRows += QString::number(rowNumbers[i]);
        }
    }

    // Выводим результаты
    QString result = QString("Минимальная сумма (%1) в строках: %2\n"
                           "Средняя сумма: %3\n"
                           "Максимальная сумма (%4) в строках: %5")
                           .arg(minSum)
                           .arg(minRows)
                           .arg(avgSum, 0, 'f', 2)
                           .arg(maxSum)
                           .arg(maxRows);

    QMessageBox::information(this, "Статистика", result);
}

void MainWindow::on_searchButton_clicked()
{
    QString searchText = ui->searchLineEdit->text();
    int column = ui->searchColumnBox->currentIndex();
    int rows = ui->tableWidget->rowCount();
    QList<int> positions;

    // Поиск значений
    for(int i = 0; i < rows; i++) {
        QTableWidgetItem *item = ui->tableWidget->item(i, column);
        if(item && item->text().contains(searchText, Qt::CaseInsensitive)) {
            positions.append(i + 1);
        }
    }

    // Вывод результата
    if(positions.isEmpty()) {
        QMessageBox::information(this, "Результат поиска",
                               "Значение не найдено!");
    } else {
        QString message = "Значение найдено в строках: ";
        for(int i = 0; i < positions.size(); i++) {
            message += QString::number(positions[i]);
            if(i < positions.size() - 1) {
                message += ", ";
            }
        }
        QMessageBox::information(this, "Результат поиска", message);
    }
}

void MainWindow::on_sortButton_clicked()
{
    int column = ui->sortColumnBox->currentIndex();
    sortTableByColumn(column);
}

void MainWindow::sortTableByColumn(int column)
{
    ui->tableWidget->sortItems(column);
}

void MainWindow::removeDuplicatesByColumn(int column)
{
    QSet<QString> uniqueValues;
    QList<int> rowsToKeep;
    int rows = ui->tableWidget->rowCount();
    bool hasDuplicates = false;

    // Первый проход - находим уникальные значения и строки для сохранения
    for(int i = 0; i < rows; i++) {
        QTableWidgetItem *item = ui->tableWidget->item(i, column);
        if(!item || item->text().isEmpty()) continue;

        QString value = item->text();
        if(!uniqueValues.contains(value)) {
            uniqueValues.insert(value);
            rowsToKeep.append(i);
        } else {
            hasDuplicates = true;
        }
    }

    if(!hasDuplicates) {
        QMessageBox::information(this, "Информация", "Дубликаты не найдены!");
        return;
    }

    // Создаем новую таблицу только с уникальными строками
    QList<QStringList> newData;
    for(int row : rowsToKeep) {
        QStringList rowData;
        for(int j = 0; j < COLUMN_COUNT; j++) {
            QTableWidgetItem *item = ui->tableWidget->item(row, j);
            rowData << (item ? item->text() : "");
        }
        newData.append(rowData);
    }

    // Обновляем таблицу
    ui->tableWidget->setRowCount(rowsToKeep.size());
    for(int i = 0; i < newData.size(); i++) {
        for(int j = 0; j < COLUMN_COUNT; j++) {
            QTableWidgetItem *item = new QTableWidgetItem(newData[i][j]);
            ui->tableWidget->setItem(i, j, item);
        }
    }

    QMessageBox::information(this, "Информация",
                           QString("Дубликаты удалены. Осталось %1 уникальных записей.")
                           .arg(rowsToKeep.size()));
}

void MainWindow::on_removeDuplicatesButton_clicked()
{
    int column = ui->duplicatesColumnBox->currentIndex();
    removeDuplicatesByColumn(column);
}

QJsonObject MainWindow::rowToJson(int row)
{
    QJsonObject rowObject;
    rowObject["id"] = ui->tableWidget->item(row, 0)->text().toInt();
    rowObject["surname"] = ui->tableWidget->item(row, 1)->text();
    rowObject["name"] = ui->tableWidget->item(row, 2)->text();
    rowObject["patronymic"] = ui->tableWidget->item(row, 3)->text();
    rowObject["phone"] = ui->tableWidget->item(row, 4)->text();
    rowObject["email"] = ui->tableWidget->item(row, 5)->text();
    return rowObject;
}

void MainWindow::jsonToRow(const QJsonObject &obj, int row)
{
    QString surname = obj["surname"].toString();
    QString name = obj["name"].toString();
    QString patronymic = obj["patronymic"].toString();

    // Проверка корректности
    if (!validateName(surname) || !validateName(name) || !validateName(patronymic)) {
        QMessageBox::warning(this, "Ошибка",
            QString("Ошибка в строке %1: Некорректный формат имени, фамилии или отчества").arg(row + 1));
        return;
    }

    ui->tableWidget->setItem(row, 0, new QTableWidgetItem(QString::number(obj["id"].toInt())));
    ui->tableWidget->setItem(row, 1, new QTableWidgetItem(surname));
    ui->tableWidget->setItem(row, 2, new QTableWidgetItem(name));
    ui->tableWidget->setItem(row, 3, new QTableWidgetItem(patronymic));
    ui->tableWidget->setItem(row, 4, new QTableWidgetItem(obj["phone"].toString()));
    ui->tableWidget->setItem(row, 5, new QTableWidgetItem(obj["email"].toString()));
}

void MainWindow::on_saveJsonButton_clicked()
{
    QString fileName = QFileDialog::getSaveFileName(this, "Сохранить данные",
                                                  QString(), "JSON (*.json)");
    if(fileName.isEmpty())
        return;

    QJsonArray jsonArray;
    int rows = ui->tableWidget->rowCount();

    for(int i = 0; i < rows; i++) {
        jsonArray.append(rowToJson(i));
    }

    QJsonDocument document(jsonArray);
    QFile file(fileName);

    if(!file.open(QIODevice::WriteOnly)) {
        QMessageBox::warning(this, "Ошибка", "Не удалось открыть файл для записи!");
        return;
    }

    file.write(document.toJson());
    file.close();

    QMessageBox::information(this, "Успех", "Данные успешно сохранены в файл!");
}

void MainWindow::on_loadJsonButton_clicked()
{
    QString fileName = QFileDialog::getOpenFileName(this, "Загрузить данные",
                                                  QString(), "JSON (*.json)");
    if(fileName.isEmpty())
        return;

    QFile file(fileName);
    if(!file.open(QIODevice::ReadOnly)) {
        QMessageBox::warning(this, "Ошибка", "Не удалось открыть файл для чтения!");
        return;
    }

    QByteArray data = file.readAll();
    file.close();

    QJsonDocument document = QJsonDocument::fromJson(data);
    if(document.isNull()) {
        QMessageBox::warning(this, "Ошибка", "Файл содержит некорректные данные!");
        return;
    }

    QJsonArray jsonArray = document.array();
    ui->tableWidget->setRowCount(jsonArray.size());
    lastId = 0;

    for(int i = 0; i < jsonArray.size(); i++) {
        QJsonObject obj = jsonArray[i].toObject();
        jsonToRow(obj, i);
        lastId = qMax(lastId, obj["id"].toInt());
    }

    QMessageBox::information(this, "Успех", "Данные успешно загружены из файла!");
}

void MainWindow::on_tableWidget_cellChanged(int row, int column)
{
    // Проверяем только колонки с именем, фамилией и отчеством
    if (column >= 1 && column <= 3) {
        QTableWidgetItem *item = ui->tableWidget->item(row, column);
        if (item && !item->text().isEmpty()) {  // Проверяем только непустые ячейки
            QString value = item->text();
            if (!validateName(value)) {
                QMessageBox::warning(this, "Ошибка",
                    "Имя, фамилия и отчество должны начинаться с заглавной буквы, "
                    "а остальные буквы должны быть строчными");
                // Возвращаем предыдущее значение или очищаем ячейку
                item->setText("");
            }
        }
    }
}
