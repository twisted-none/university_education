# E-Commerce Project

Интернет-магазин с панелью администратора, использующий GraphQL, WebSockets и балансировку нагрузки.

## Функциональность проекта

### Клиентское приложение (Customer App)
- Отображение товаров по категориям
- GraphQL API для получения данных
- Чат поддержки на WebSockets

### Административная панель (Admin App)
- REST API для управления товарами
- Добавление, редактирование и удаление товаров
- Чат для общения с клиентами

### WebSocket сервер
- Обеспечивает двустороннюю связь между клиентами и администраторами
- Хранит историю сообщений

## Структура проекта

```
e-commerce-project/
├── customer-app/
│   ├── frontend/
│   │   ├── index.html
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       ├── app.js
│   │       ├── graphql-client.js
│   │       └── websocket-client.js
│   └── backend/
│       ├── server.js
│       ├── schema.js (GraphQL)
│       └── data/
│           └── products.json
├── admin-app/
│   ├── frontend/
│   │   ├── index.html
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       ├── api-client.js
│   │       └── websocket-client.js
│   └── backend/
│       ├── server.js
│       ├── routes/
│       │   └── products.js
│       └── data/
│           └── products.json
├── websocket-server/
│   ├── server.js
│   └── package.json
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Технологии

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **API**: GraphQL (customer-app), REST (admin-app)
- **Real-time Communication**: WebSockets
- **Контейнеризация**: Docker, Docker Compose
- **Балансировка нагрузки**: Nginx

## Инструкция по установке и запуску

### Предварительные требования
- Docker и Docker Compose
- Git

### Шаги для запуска

1. Клонировать репозиторий:
```bash
git clone https://your-repo-url/e-commerce-project.git
cd e-commerce-project
```

2. Запустить приложение с помощью Docker Compose:
```bash
docker-compose up --build
```

3. Приложение будет доступно по следующим адресам:
   - Клиентское приложение: http://customer.localhost
   - Админ панель: http://admin.localhost
   - WebSocket сервер: ws://websocket.localhost

### Примечание для локального тестирования:

Для локального тестирования нужно добавить следующие записи в файл hosts:
```
127.0.0.1 customer.localhost
127.0.0.1 admin.localhost
127.0.0.1 websocket.localhost
```

## API

### GraphQL API (клиентское приложение)
- Endpoint: `/graphql`
- Доступные запросы:
  - `products`: получить все товары
  - `product(id)`: получить товар по ID
  - `categories`: получить все категории
  - `productsByCategory(categoryId)`: получить товары по категории
  - `productNames`: получить только имена товаров
  - `productPrices`: получить только цены товаров
  - `productDescriptions`: получить только описания товаров

### REST API (админ панель)
- Получить все товары: GET `/api/products`
- Получить товар по ID: GET `/api/products/:id`
- Добавить товар(ы): POST `/api/products`
- Обновить товар: PUT `/api/products/:id`
- Удалить товар: DELETE `/api/products/:id`

### WebSocket API
- Подключение для клиента: `ws://websocket.localhost/?type=customer`
- Подключение для админа: `ws://websocket.localhost/?type=admin`
- Формат сообщений: `{ type: "message", text: "Содержание сообщения" }`

## Балансировка нагрузки

В проекте настроена балансировка между тремя экземплярами клиентского бэкенда через Nginx. Конфигурация находится в файле `nginx/nginx.conf`.