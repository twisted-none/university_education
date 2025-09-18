/**
 * WebSocket Client for Customer and Admin applications
 */
class WebSocketClient {
    /**
     * Initialize WebSocket client
     * @param {string} serverUrl - WebSocket server URL
     * @param {string} type - Client type ('customer' or 'admin')
     * @param {Function} messageCallback - Callback for incoming messages
     */
    constructor(serverUrl, type = 'customer', messageCallback = null) {
      this.serverUrl = serverUrl;
      this.type = type;
      this.messageCallback = messageCallback;
      this.socket = null;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.reconnectDelay = 2000; // 2 seconds
      this.connected = false;
    }
  
    /**
     * Connect to WebSocket server
     */
    connect() {
      // Create WebSocket URL with client type
      const url = `${this.serverUrl}?type=${this.type}`;
      
      this.socket = new WebSocket(url);
      
      // Connection opened
      this.socket.addEventListener('open', (event) => {
        console.log('Connected to WebSocket server');
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // Display connection status on UI
        this.updateConnectionStatus(true);
      });
      
      // Listen for messages
      this.socket.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Message from server:', message);
          
          // Call message callback if provided
          if (this.messageCallback) {
            this.messageCallback(message);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });
      
      // Connection closed
      this.socket.addEventListener('close', (event) => {
        console.log('Disconnected from WebSocket server');
        this.connected = false;
        this.updateConnectionStatus(false);
        
        // Try to reconnect
        this.tryReconnect();
      });
      
      // Connection error
      this.socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        this.connected = false;
        this.updateConnectionStatus(false);
      });
    }
  
    /**
     * Attempt to reconnect to the server
     */
    tryReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        setTimeout(() => {
          this.connect();
        }, this.reconnectDelay);
      } else {
        console.error('Max reconnect attempts reached');
        this.updateConnectionStatus(false, 'Failed to connect after multiple attempts');
      }
    }
  
    /**
     * Send a message to the server
     * @param {string} text - Message text
     */
    sendMessage(text) {
      if (!this.connected) {
        console.error('Not connected to WebSocket server');
        return false;
      }
      
      try {
        const message = {
          type: 'message',
          text: text
        };
        
        this.socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    }
  
    /**
     * Close the WebSocket connection
     */
    disconnect() {
      if (this.socket) {
        this.socket.close();
      }
    }
  
    /**
     * Update connection status in UI
     * @param {boolean} connected - Connection status
     * @param {string} message - Optional status message
     */
    updateConnectionStatus(connected, message = '') {
      const statusElement = document.getElementById('connection-status');
      if (statusElement) {
        statusElement.className = connected ? 'connected' : 'disconnected';
        statusElement.textContent = connected ? 'Connected' : 'Disconnected';
        
        if (message) {
          statusElement.textContent += `: ${message}`;
        }
      }
    }
  }
  
  // Export the client
  window.WebSocketClient = WebSocketClient;