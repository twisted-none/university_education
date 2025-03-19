document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const addProductForm = document.getElementById('addProductForm');
    const bulkProductsInput = document.getElementById('bulkProducts');
    const addBulkBtn = document.getElementById('addBulkBtn');
    const productList = document.getElementById('productList');
    const searchInput = document.getElementById('searchInput');
    const refreshBtn = document.getElementById('refreshBtn');
    const editModal = document.getElementById('editModal');
    const editProductForm = document.getElementById('editProductForm');
    const closeBtn = document.querySelector('.close-btn');
    
    // API URL
    const API_URL = 'http://localhost:8080/api';
    
    // Загрузка списка товаров при загрузке страницы
    loadProducts();
    
    // Обработчик формы добавления товара
    addProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const price = parseFloat(document.getElementById('price').value);
        const description = document.getElementById('description').value;
        
        // Получаем выбранные категории
        const categoriesCheckboxes = document.querySelectorAll('input[name="categories"]:checked');
        const categories = Array.from(categoriesCheckboxes).map(checkbox => checkbox.value);
        
        const product = {
            name,
            price,
            description,
            categories
        };
        
        addProduct(product);
    });
    
    // Обработчик добавления нескольких товаров
    addBulkBtn.addEventListener('click', function() {
        try {
            const products = JSON.parse(bulkProductsInput.value);
            if (!Array.isArray(products)) {
                alert('Пожалуйста, введите корректный JSON-массив товаров');
                return;
            }
            
            addBulkProducts(products);
        } catch (error) {
            alert('Некорректный JSON-формат: ' + error.message);
        }
    });
    
    // Обработчик поиска товаров
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const productItems = document.querySelectorAll('.product-item');
        
        productItems.forEach(item => {
            const productName = item.querySelector('h3').textContent.toLowerCase();
            if (productName.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // Обработчик обновления списка товаров
    refreshBtn.addEventListener('click', loadProducts);
    
    // Обработчик закрытия модального окна
    closeBtn.addEventListener('click', function() {
        editModal.style.display = 'none';
    });
    
    // Закрывать модальное окно при клике вне его содержимого
    window.addEventListener('click', function(e) {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });
    
    // Обработчик формы редактирования товара
    editProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('editId').value;
        const name = document.getElementById('editName').value;
        const price = parseFloat(document.getElementById('editPrice').value);
        const description = document.getElementById('editDescription').value;
        
        // Получаем выбранные категории
        const categoriesCheckboxes = document.querySelectorAll('input[name="editCategories"]:checked');
        const categories = Array.from(categoriesCheckboxes).map(checkbox => checkbox.value);
        
        const product = {
            id,
            name,
            price,
            description,
            categories
        };
        
        updateProduct(id, product);
    });
    
    // Функция загрузки списка товаров
    function loadProducts() {
        productList.innerHTML = '<div class="loading">Загрузка товаров...</div>';
        
        fetch(`${API_URL}/products`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось загрузить товары');
                }
                return response.json();
            })
            .then(data => {
                // Проверяем, есть ли в data свойство products
                const products = data.products || data;
                displayProducts(products);
            })
            .catch(error => {
                productList.innerHTML = `<div class="error">Ошибка: ${error.message}</div>`;
            });
    }
    
    // Функция отображения списка товаров
    function displayProducts(products) {
        if (products.length === 0) {
            productList.innerHTML = '<div class="no-products">Товары не найдены</div>';
            return;
        }
        
        productList.innerHTML = '';
        
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            productElement.dataset.id = product.id;
            
            productElement.innerHTML = `
                <h3>${product.name}</h3>
                <p class="price">${product.price.toFixed(2)} ₽</p>
                <p class="description">${product.description}</p>
                <p class="categories">Категории: ${product.categories.join(', ') || 'Нет категорий'}</p>
                <div class="product-actions">
                    <button class="btn edit-btn">Редактировать</button>
                    <button class="btn delete-btn">Удалить</button>
                </div>
            `;
            
            // Добавляем обработчики кнопок
            const editBtn = productElement.querySelector('.edit-btn');
            const deleteBtn = productElement.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => openEditModal(product));
            deleteBtn.addEventListener('click', () => deleteProduct(product.id));
            
            productList.appendChild(productElement);
        });
    }
    
    // Функция добавления товара
    function addProduct(product) {
        fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось добавить товар');
            }
            return response.json();
        })
        .then(data => {
            alert('Товар успешно добавлен!');
            addProductForm.reset();
            loadProducts();
        })
        .catch(error => {
            alert('Ошибка: ' + error.message);
        });
    }
    
    // Функция добавления нескольких товаров
    function addBulkProducts(products) {
        fetch(`${API_URL}/products/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(products)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось добавить товары');
            }
            return response.json();
        })
        .then(data => {
            alert(`Успешно добавлено ${data.length} товаров!`);
            bulkProductsInput.value = '';
            loadProducts();
        })
        .catch(error => {
            alert('Ошибка: ' + error.message);
        });
    }
    
    // Функция открытия модального окна редактирования
    function openEditModal(product) {
        document.getElementById('editId').value = product.id;
        document.getElementById('editName').value = product.name;
        document.getElementById('editPrice').value = product.price;
        document.getElementById('editDescription').value = product.description;
        
        // Сбрасываем все чекбоксы категорий
        document.querySelectorAll('input[name="editCategories"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Отмечаем чекбоксы выбранных категорий
        product.categories.forEach(category => {
            const checkbox = document.querySelector(`input[name="editCategories"][value="${category}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        editModal.style.display = 'block';
    }
    
    // Функция обновления товара
    function updateProduct(id, product) {
        fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось обновить товар');
            }
            return response.json();
        })
        .then(data => {
            alert('Товар успешно обновлен!');
            editModal.style.display = 'none';
            loadProducts();
        })
        .catch(error => {
            alert('Ошибка: ' + error.message);
        });
    }
    
    // Функция удаления товара
    function deleteProduct(id) {
        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
            fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось удалить товар');
                }
                // Проверяем, есть ли содержимое для преобразования в JSON
                if (response.status === 204) {
                    return null; // Нет содержимого
                }
                return response.json();
            })
            .then(() => {
                alert('Товар успешно удален!');
                loadProducts();
            })
            .catch(error => {
                alert('Ошибка: ' + error.message);
            });
        }
    }

    initAdminChat();
});

// Функция для инициализации чата администратора
// Функция для инициализации чата администратора
function initAdminChat() {
    // Создаем контейнер для чата
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    chatContainer.innerHTML = `
        <div class="chat-header">
            <h3>Чат с пользователями</h3>
            <button id="toggle-chat">Развернуть</button>
        </div>
        <div class="chat-body" style="display: none;">
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-container">
                <input type="text" id="chat-input" placeholder="Введите сообщение...">
                <button id="send-message">Отправить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(chatContainer);
    
    // Получаем ссылки на элементы чата
    const toggleChat = document.getElementById('toggle-chat');
    const chatBody = document.querySelector('.chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');
    const messagesContainer = document.getElementById('chat-messages');
    
    // Обработчик переключения видимости чата
    toggleChat.addEventListener('click', () => {
        if (chatBody.style.display === 'none') {
            chatBody.style.display = 'flex';
            toggleChat.textContent = 'Свернуть';
        } else {
            chatBody.style.display = 'none';
            toggleChat.textContent = 'Развернуть';
        }
    });
    
    // Подключаемся к WebSocket серверу
    const chatSocket = new WebSocket(`ws://${window.location.hostname}:3000/admin`);
    
    // Обработчик открытия соединения
    chatSocket.onopen = () => {
        console.log('WebSocket соединение установлено');
        // Добавляем системное сообщение о подключении
        addChatMessage({
            type: 'system',
            message: 'Вы подключились к чату как администратор',
            userType: 'system',
            timestamp: new Date().toISOString()
        });
    };
    
    // Обработчик входящих сообщений
    chatSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        addChatMessage(message);
    };
    
    // Обработчик ошибок
    chatSocket.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
        addChatMessage({
            type: 'system',
            message: 'Ошибка подключения к чату',
            userType: 'system',
            timestamp: new Date().toISOString()
        });
    };
    
    // Обработчик закрытия соединения
    chatSocket.onclose = () => {
        console.log('WebSocket соединение закрыто');
        addChatMessage({
            type: 'system',
            message: 'Соединение с чатом закрыто',
            userType: 'system',
            timestamp: new Date().toISOString()
        });
    };
    
    // Функция отправки сообщения
    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText && chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.send(JSON.stringify({
                type: 'message',
                message: messageText
            }));
            chatInput.value = '';
        }
    }
    
    // Обработчик отправки сообщения
    sendButton.addEventListener('click', sendMessage);
    
    // Отправка сообщения по нажатию клавиши Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Функция для добавления сообщения в чат
    function addChatMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${message.userType}`;
        
        const timestamp = new Date(message.timestamp).toLocaleTimeString();
        
        // Формирование содержимого сообщения в зависимости от типа
        if (message.type === 'system') {
            messageElement.innerHTML = `<div class="message-text">${message.message}</div>`;
        } else {
            // Определяем, кто отправитель сообщения
            let userLabel;
            if (message.userType === 'admin') {
                userLabel = 'Вы';
            } else {
                userLabel = `Пользователь ${message.userId.substring(0, 5)}`;
            }
            
            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="message-user">${userLabel}</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-text">${message.message}</div>
            `;
        }
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}