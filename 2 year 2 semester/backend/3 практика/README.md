# Проект интернет-магазина с панелью администратора

Проект содержит две серверные части:
1. Клиентский сервер (порт 3000) - отображает каталог товаров
2. Административный сервер (порт 8080) - позволяет управлять товарами

## Установка и запуск

### Клонирование репозитория
```bash
git clone <URL репозитория>
cd e-commerce-project
```

### Установка зависимостей
```bash
npm install
```

### Запуск обоих серверов
```bash
npm start
```

### Запуск только клиентского сервера
```bash
npm run start:client
```

### Запуск только административного сервера
```bash
npm run start:admin
```

## Использование

### Клиентская часть
Откройте в браузере: http://localhost:3000

### Административная панель
Откройте в браузере: http://localhost:8080

### API документация
Откройте в браузере: http://localhost:8080/api-docs

## Функциональность

### Клиентская часть
- Просмотр всех товаров
- Фильтрация товаров по категориям

### Административная панель
- Добавление одного или нескольких товаров
- Редактирование товара по ID
- Удаление товара по ID