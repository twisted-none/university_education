FROM python:3.9

WORKDIR /app

ENV TZ=Europe/Moscow
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем приложение
COPY app/ /app/app/
COPY data/ /app/data/

# Создаем директорию данных, если она не существует
RUN mkdir -p /app/data

# Устанавливаем правильные разрешения
RUN chmod -R 755 /app

EXPOSE 8000

# Запускаем приложение
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]