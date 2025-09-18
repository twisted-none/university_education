#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QString>

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
    void onOperationButtonClicked();
    void onTrigFunctionButtonClicked();

private:
    Ui::MainWindow *ui;
    bool validateInput(const QString &number);
    double convertToDouble(const QString &number);
    void displayResult(double result);
    double calculateTrigFunction(double value, const QString &function);
};
#endif // MAINWINDOW_H
