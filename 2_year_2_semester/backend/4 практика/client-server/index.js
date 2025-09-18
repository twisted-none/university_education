const express = require('express');
const path = require('path');
const fs = require('fs');
const { ApolloServer } = require('apollo-server-express');
const { WebSocketServer } = require('ws');
const http = require('http');

// Импорт GraphQL схемы и резолверов
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const app = express();
const PORT = 3000;

// Обслуживание статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Создаем HTTP сервер
const httpServer = http.createServer(app);

// Настройка Apollo Server для GraphQL
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app });
  
  console.log(`GraphQL доступен по адресу http://localhost:${PORT}${server.graphqlPath}`);
}

startApolloServer();

// Создаем WebSocket сервер для чата
const wss = new WebSocketServer({ server: httpServer });

// Список подключенных клиентов
const clients = new Map();

// Обработка WebSocket соединений
wss.on('connection', (ws, req) => {
  const userId = Date.now().toString();
  const userType = req.url.includes('admin') ? 'admin' : 'customer';
  
  // Сохраняем информацию о клиенте
  clients.set(ws, {
    id: userId,
    type: userType
  });
  
  console.log(`Новое ${userType} соединение: ${userId}`);
  
  // Отправляем приветственное сообщение
  ws.send(JSON.stringify({
    type: 'system',
    message: `Добро пожаловать в чат поддержки!`,
    userId: 'system',
    userType: 'system',
    timestamp: new Date().toISOString()
  }));
  
  // Обработка входящих сообщений
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const clientInfo = clients.get(ws);
      
      // Добавляем информацию о пользователе и времени
      const messageToSend = {
        ...data,
        userId: clientInfo.id,
        userType: clientInfo.type,
        timestamp: new Date().toISOString()
      };
      
      // Отправляем сообщение всем клиентам
      clients.forEach((client, clientWs) => {
        if (clientWs.readyState === clientWs.OPEN) {
          clientWs.send(JSON.stringify(messageToSend));
        }
      });
    } catch (error) {
      console.error('Ошибка при обработке сообщения:', error);
    }
  });
  
  // Обработка закрытия соединения
  ws.on('close', () => {
    const clientInfo = clients.get(ws);
    console.log(`Соединение закрыто: ${clientInfo.id}`);
    clients.delete(ws);
  });
});

// Обработка GET запроса к корневому URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
httpServer.listen(PORT, () => {
  console.log(`Клиентский сервер запущен на порту ${PORT}`);
  console.log(`Откройте http://localhost:${PORT} в браузере`);
});