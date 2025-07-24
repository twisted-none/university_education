# backend/Dockerfile

# Используем официальный Python образ на основе Debian
FROM python:3.11-slim-bookworm

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости для psycopg2-binary
# apt-get работает в этом образе
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем файл зависимостей
COPY requirements.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код приложения
COPY . .

# Открываем порт
EXPOSE 8000

# Команда запуска будет указана в docker-compose.yml,
# поэтому CMD здесь можно опустить или оставить как запасной вариант.
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]