using System;
using System.Threading;

class Thermostat
{
    public event Action<string> TemperatureAlert;
    private int minTemp;
    private int maxTemp;
    private Random rand = new Random();
    private bool isRunning;

    public Thermostat(int min, int max)
    {
        minTemp = min;
        maxTemp = max;
    }

    public void SimulateTemperature()
    {
        isRunning = true;
        int currentTemp = rand.Next(minTemp, maxTemp);
        Thread simulationThread = new Thread(() =>
        {
            while (isRunning)
            {
                CheckTemperature(currentTemp);
                Thread.Sleep(2000);
            }
        });

        simulationThread.Start();
        Console.WriteLine("Нажмите любую клавишу для остановки...");
        Console.ReadKey();
        isRunning = false;
        simulationThread.Join();
    }

    private void CheckTemperature(int currentTemp)
    {
        currentTemp += rand.Next(-50, 50);
        Console.WriteLine($"Текущая температура: {currentTemp}°C");
        if (currentTemp < minTemp) TemperatureAlert?.Invoke("Предупреждение: переохлаждение!");
        if (currentTemp > maxTemp) TemperatureAlert?.Invoke("Предупреждение: перегрев!");
    }
}

class ThermostatProgram
{
    static void Main()
    {
        Console.Write("Введите минимальную температуру: ");
        int min = int.Parse(Console.ReadLine());
        Console.Write("Введите максимальную температуру: ");
        int max = int.Parse(Console.ReadLine());

        Thermostat thermostat = new Thermostat(min, max);
        thermostat.TemperatureAlert += msg => Console.WriteLine(msg);
        thermostat.SimulateTemperature();
    }
}
