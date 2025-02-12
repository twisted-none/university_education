#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QTableWidget>
#include <QPushButton>
#include <QLineEdit>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QMessageBox>
#include <QRadioButton>
#include <QButtonGroup>
#include <QLabel>
#include <random>
#include <QList>

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
    void setRowCount();
    void fillRandomNumbers();
    void calculateStats();
    void findNumber();
    void removeDuplicates();
    void sortTable();

private:
    Ui::MainWindow *ui;
    bool validateTableData();
    bool isNumber(const QString& str);
    void initializeUI();
    void setupConnections();

    QPushButton *btnSetRows;
    QPushButton *btnRandom;
    QPushButton *btnCalcStats;
    QPushButton *btnFind;
    QPushButton *btnRemoveDuplicates;
    QPushButton *btnSort;
    QLineEdit *leRowCount;
    QLineEdit *leFindNumber;
    QTableWidget *tableWidget;
    QRadioButton *rbAscending;
    QRadioButton *rbDescending;
    QButtonGroup *sortDirectionGroup;
};

#endif // MAINWINDOW_H
