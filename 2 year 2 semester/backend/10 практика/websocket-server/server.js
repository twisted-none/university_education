const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 9000;

// Stores client connections
const clients = {
  customers: new Set(),
  admins: new Set()
};

// Message history
const messageHistory = [];
const MAX_HISTORY = 50;

// Helper to broadcast messages to all connected clients
const broadcastMessage = (message) => {
  const messageString = JSON.stringify(message);
  
  // Send to all customer clients
  clients.customers.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
  
  // Send to all admin clients
  clients.admins.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
  
  // Store message in history
  messageHistory.push(message);
  if (messageHistory.length > MAX_HISTORY) {
    messageHistory.shift();
  }
};

wss.on('connection', (ws, req) => {
  // Parse client type from URL query params
  const clientType = req.url.includes('type=admin') ? 'admin' : 'customer';
  
  // Add client to appropriate set
  if (clientType === 'admin') {
    clients.admins.add(ws);
  } else {
    clients.customers.add(ws);
  }
  
  console.log(`New ${clientType} client connected`);
  
  // Send message history to new client
  if (messageHistory.length > 0) {
    ws.send(JSON.stringify({
      type: 'history',
      data: messageHistory
    }));
  }
  
  // Handle messages from clients
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      // Add sender type and timestamp
      const timestamp = new Date().toISOString();
      const enhancedMessage = {
        ...message,
        sender: clientType,
        timestamp
      };
      
      // Broadcast message to all clients
      broadcastMessage(enhancedMessage);
      
      console.log(`Message from ${clientType}: ${message.text}`);
    } catch (error) {
      console.error('Invalid message format:', error);
    }
  });
  
  // Handle client disconnection
  ws.on('close', () => {
    if (clientType === 'admin') {
      clients.admins.delete(ws);
    } else {
      clients.customers.delete(ws);
    }
    console.log(`${clientType} client disconnected`);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    text: `Welcome to the ${clientType === 'admin' ? 'admin' : 'customer'} chat!`,
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});