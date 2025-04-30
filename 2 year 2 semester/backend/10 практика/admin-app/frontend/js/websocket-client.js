// WebSocket client for admin support chat
class ChatClient {
    constructor(url) {
        this.url = url;
        this.socket = null;
        this.connected = false;
        this.messageCallback = null;
        this.clientId = 'admin-' + Math.random().toString(36).substr(2, 9);
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(this.url);

            this.socket.onopen = () => {
                this.connected = true;
                this.sendSystemMessage({
                    type: 'connection',
                    clientId: this.clientId,
                    userType: 'admin'
                });
                resolve();
            };

            this.socket.onclose = () => {
                this.connected = false;
                console.log('WebSocket connection closed');
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            };

            this.socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (this.messageCallback) {
                    this.messageCallback(message);
                }
            };
        });
    }

    disconnect() {
        if (this.socket && this.connected) {
            this.socket.close();
        }
    }

    sendMessage(text) {
        if (!this.connected) {
            throw new Error('WebSocket not connected');
        }

        const message = {
            type: 'chat',
            clientId: this.clientId,
            userType: 'admin',
            text: text,
            timestamp: new Date().toISOString()
        };

        this.socket.send(JSON.stringify(message));
        return message;
    }

    sendSystemMessage(data) {
        if (!this.connected) {
            throw new Error('WebSocket not connected');
        }
        
        this.socket.send(JSON.stringify(data));
    }

    onMessage(callback) {
        this.messageCallback = callback;
    }
}

// Create WebSocket client instance
const chatClient = new ChatClient('ws://localhost:4000');