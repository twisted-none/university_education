# Стадия сборки
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Исправляем проблему с правами
RUN chmod +x ./node_modules/.bin/vite
RUN npm run build

# Стадия production
FROM nginx:alpine

# Копируем результаты сборки
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Экспозим порты
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]