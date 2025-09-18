#include "mainwindow.h"
#include "./ui_mainwindow.h"
#include <QDebug>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    setupConnections();

    // Initialize table
    ui->tableWidget->setRowCount(10);
    ui->tableWidget->setColumnCount(1);

    // Initialize cells
    for(int i = 0; i < ui->tableWidget->rowCount(); i++) {
        QTableWidgetItem *item = new QTableWidgetItem();
        ui->tableWidget->setItem(i, 0, item);
    }
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::setupConnections()
{
    connect(ui->pushButton_setRows, &QPushButton::clicked, this, &MainWindow::setRowCount);
    connect(ui->pushButton_random, &QPushButton::clicked, this, &MainWindow::fillRandomNumbers);
    connect(ui->pushButton_stats, &QPushButton::clicked, this, &MainWindow::calculateStats);
    connect(ui->pushButton_find, &QPushButton::clicked, this, &MainWindow::findNumber);
    connect(ui->pushButton_removeDuplicates, &QPushButton::clicked, this, &MainWindow::removeDuplicates);
    connect(ui->pushButton_sort, &QPushButton::clicked, this, &MainWindow::sortTable);
}

void MainWindow::setRowCount()
{
    bool ok;
    int rows = ui->lineEdit_rowCount->text().toInt(&ok);

    if (!ok || rows <= 0) {
        QMessageBox::warning(this, "Ошибка", "Введите корректное количество строк");
        return;
    }

    // Save existing values
    QList<QString> existingValues;
    int currentRows = ui->tableWidget->rowCount();
    for (int i = 0; i < currentRows; ++i) {
        QTableWidgetItem *item = ui->tableWidget->item(i, 0);
        if (item) {
            existingValues.append(item->text());
        } else {
            existingValues.append("");
        }
    }

    ui->tableWidget->setRowCount(rows);

    // Restore existing values
    for (int i = 0; i < qMin(rows, existingValues.size()); ++i) {
        QTableWidgetItem *item = ui->tableWidget->item(i, 0);
        if (!item) {
            item = new QTableWidgetItem();
            ui->tableWidget->setItem(i, 0, item);
        }
        item->setText(existingValues[i]);
    }

    // Initialize new cells
    for (int i = existingValues.size(); i < rows; ++i) {
        QTableWidgetItem *item = new QTableWidgetItem();
        ui->tableWidget->setItem(i, 0, item);
    }
}

void MainWindow::fillRandomNumbers()
{
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, 100);

    int rows = ui->tableWidget->rowCount();
    for (int i = 0; i < rows; ++i) {
        QTableWidgetItem *item = ui->tableWidget->item(i, 0);
        if (!item) {
            item = new QTableWidgetItem();
            ui->tableWidget->setItem(i, 0, item);
        }
        item->setText(QString::number(dis(gen)));
    }
}

void MainWindow::calculateStats()
{
    if (!validateTableData()) {
        return;
    }

    int rows = ui->tableWidget->rowCount();
    if (rows == 0) {
        QMessageBox::warning(this, "Ошибка", "Таблица пуста");
        return;
    }

    int min = INT_MAX;
    int max = INT_MIN;
    double sum = 0;
    int count = 0;

    for (int i = 0; i < rows; ++i) {
        QTableWidgetItem *item = ui->tableWidget->item(i, 0);
        if (item) {
            bool ok;
            int value = item->text().toInt(&ok);
            if (ok) {
                min = qMin(min, value);
                max = qMax(max, value);
                sum += value;
                count++;
            }
        }
    }

    if (count == 0) {
        QMessageBox::warning(this, "Ошибка", "Нет корректных данных для расчёта");
        return;
    }

    QString result = QString("Минимум: %1\nМаксимум: %2\nСреднее: %3")
                        .arg(min)
                        .arg(max)
                        .arg(sum / count);

    QMessageBox::information(this, "Статистика", result);
}

void MainWindow::findNumber()
{
    if (!validateTableData()) {
        return;
    }

    bool ok;
    int searchValue = ui->lineEdit_search->text().toInt(&ok);
    if (!ok) {
        QMessageBox::warning(this, "Ошибка", "Введите корректное число для поиска");
        return;
    }

    QList<int> positions;
    int rows = ui->tableWidget->rowCount();

    for (int i = 0; i < rows; ++i) {
        QTableWidgetItem *item = ui->tableWidget->item(i, 0);
        if (item && item->text().toInt() == searchValue) {
            positions.append(i + 1);
        }
    }

    if (positions.isEmpty()) {
        QMessageBox::warning(this, "Результат поиска", "Число не найдено");
    } else {
        QString result = "Число найдено в строках: " +
                        QString::number(positions[0]);
        for (int i = 1; i < positions.size(); ++i) {
            result += ", " + QString::number(positions[i]);
        }
        QMessageBox::information(this, "Результат поиска", result);
    }
}

void MainWindow::removeDuplicates()
{
    if (!validateTableData()) {
        return;
    }

    QSet<int> uniqueValues;
    QList<int> valuesToKeep;
    int rows = ui->tableWidget->rowCount();

    // Collect unique values
    for (int i = 0; i < rows; ++i) {
        QTableWidgetItem *item = ui->tableWidget->item(i, 0);
        if (item) {
            bool ok;
            int value = item->text().toInt(&ok);
            if (ok && !uniqueValues.contains(value)) {
                uniqueValues.insert(value);
                valuesToKeep.append(value);
            }
        }
    }

    // Update table with unique values
    ui->tableWidget->setRowCount(valuesToKeep.size());
    for (int i = 0; i < valuesToKeep.size(); ++i) {
        QTableWidgetItem *item = ui->tableWidget->item(i, 0);
        if (!item) {
            item = new QTableWidgetItem();
            ui->tableWidget->setItem(i, 0, item);
        }
        item->setText(QString::number(valuesToKeep[i]));
    }
}

void MainWindow::sortTable()
{
    if (!validateTableData()) {
        return;
    }

    int rows = ui->tableWidget->rowCount();
    QList<int> values;

    // Collect values
    for (int i = 0; i < rows; ++i) {
        QTableWidgetItem *item = ui->tableWidget->item(i, 0);
        if (item) {
            bool ok;
            int value = item->text().toInt(&ok);
            if (ok) {
                values.append(value);
            }
        }
    }

    // Sort values
    if (ui->radioButton_ascending->isChecked()) {
        std::sort(values.begin(), values.end());
    } else {
        std::sort(values.begin(), values.end(), std::greater<int>());
    }

    // Update table
    for (int i = 0; i < values.size(); ++i) {
        QTableWidgetItem *item = ui->tableWidget->item(i, 0);
        if (!item) {
            item = new QTableWidgetItem();
            ui->tableWidget->setItem(i, 0, item);
        }
        item->setText(QString::number(values[i]));
    }
}

bool MainWindow::validateTableData()
{
    int rows = ui->tableWidget->rowCount();
    for (int i = 0; i < rows; ++i) {
        QTableWidgetItem *item = ui->tableWidget->item(i, 0);
        if (!item || item->text().isEmpty()) {
            QMessageBox::warning(this, "Ошибка", QString("Ячейка в строке %1 пуста").arg(i + 1));
            return false;
        }

        bool ok;
        item->text().toInt(&ok);
        if (!ok) {
            QMessageBox::warning(this, "Ошибка",
                QString("Некорректное значение в строке %1. Допускаются только целые числа").arg(i + 1));
            return false;
        }
    }
    return true;
}
