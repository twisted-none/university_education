#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QString>
#include <QMessageBox>
#include <QRegularExpression>
#include <QRegularExpressionMatch>
#include <QStringList>
#include <QVector>

QT_BEGIN_NAMESPACE
namespace Ui { class MainWindow; }
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();
    void showWarning(const QString& message);

private slots:
    void on_registerButton_clicked();
    void on_loadButton_clicked();

private:
    Ui::MainWindow *ui;
    bool validateUsername(const QString &username, QString &error);
    bool validateFullName(const QString &fullName, QString &lastName, QString &firstName, QString &middleName, QString &error);
    bool validatePassport(const QString &passport, QString &series, QString &number, QString &error);
    bool validateBirthDate(const QString &birthDate, QString &day, QString &month, QString &year, QString &error);
    bool validatePhone(const QString &phone, QString &formattedPhone, QString &error);
    bool validateEmail(const QString &email, QString &error);
    bool validateSnils(const QString &snils, QString &formattedSnils, QString &error);
    QString getMonthName(int month);
};

#endif // MAINWINDOW_H
