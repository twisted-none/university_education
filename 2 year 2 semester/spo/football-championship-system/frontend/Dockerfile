# frontend/Dockerfile

# --- Build Stage ---
# 1. Используем образ Node.js для сборки приложения
FROM node:18-alpine AS build

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем остальной код
COPY . .

# Собираем production-билд
RUN npm run build

# --- Production Stage ---
# 2. Используем легковесный образ Nginx для раздачи
FROM nginx:stable-alpine

# Копируем собранные файлы из стадии сборки в директорию, которую слушает Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем нашу конфигурацию Nginx
# Убедитесь, что этот файл существует и правильно настроен!
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80, который слушает Nginx
EXPOSE 80

# Команда для запуска Nginx
CMD ["nginx", "-g", "daemon off;"]