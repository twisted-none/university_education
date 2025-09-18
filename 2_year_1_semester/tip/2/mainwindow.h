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

private:
    Ui::MainWindow *ui;
    bool validateInput(const QString &number, int base);
    double convertToDecimal(const QString &number, int fromBase);
    QString convertFromDecimal(double number, int toBase);
};
#endif // MAINWINDOW_H
