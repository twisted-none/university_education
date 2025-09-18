#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QLineEdit>
#include <QRadioButton>
#include <QPushButton>
#include <QStringList>
#include <QRegularExpression>
#include <fstream>

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
    void onRegisterClicked();
    void onSaveFileClicked();
    void onOpenFileClicked();

private:
    QLineEdit *usernameEdit;
    QLineEdit *fullNameEdit;
    QRadioButton *maleRadio;
    QRadioButton *femaleRadio;
    QLineEdit *passportEdit;
    QLineEdit *birthDateEdit;
    QLineEdit *phoneEdit;
    QLineEdit *emailEdit;
    QLineEdit *snilsEdit;
    QPushButton *registerButton;
    QPushButton *saveButton;
    QPushButton *openButton;

    bool validateInputs();
    bool validateUsername(const QString &username);
    bool validateFullName(const QString &fullName, QStringList &errorMessages);
    bool validatePassport(const QString &passport);
    bool validateBirthDate(const QString &birthDate);
    bool validatePhone(const QString &phone);
    bool validateEmail(const QString &email);
    bool validateSnils(const QString &snils);
    bool isLeapYear(int year);
};

#endif // MAINWINDOW_H
