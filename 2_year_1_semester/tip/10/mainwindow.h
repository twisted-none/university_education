#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QMessageBox>
#include <random>
#include <QTableWidgetItem>
#include <QSet>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QFile>
#include <QFileDialog>
#include <QRegularExpression>
#include <QComboBox>
#include <QRandomGenerator>

QT_BEGIN_NAMESPACE
namespace Ui { class MainWindow; }
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    // Существующие слоты
    void on_setRowsButton_clicked();
    void on_randomFillButton_clicked();
    void on_calculateButton_clicked();
    void on_searchButton_clicked();

    // Новые слоты
    void on_sortButton_clicked();
    void on_saveJsonButton_clicked();
    void on_loadJsonButton_clicked();
    void on_removeDuplicatesButton_clicked();
    void on_tableWidget_cellChanged(int row, int column);

private:
    Ui::MainWindow *ui;
    int lastId;

    // Вспомогательные методы
    bool isInteger(const QString &str);
    void preserveTableData(int newRows);
    bool validateEmail(const QString &email);
    bool validatePhone(const QString &phone);
    bool validateName(const QString &name);
    int calculatePhoneSum(const QString &phone);

    // Методы для генерации случайных данных
    QString generateRandomName();
    QString generateRandomSurname();
    QString generateRandomPatronymic();
    QString generateRandomPhone();
    QString generateRandomEmail();

    // Методы для работы с данными
    void updateIdColumn();
    void sortTableByColumn(int column);
    void searchInTable();
    void removeDuplicatesByColumn(int column);

    // Методы для JSON
    QJsonObject rowToJson(int row);
    void jsonToRow(const QJsonObject &obj, int row);

    // Константы
    const QStringList COLUMN_HEADERS = {"ID", "Фамилия", "Имя", "Отчество",
                                      "Номер телефона", "Email"};
    const int COLUMN_COUNT = 6;
};

#endif // MAINWINDOW_H
