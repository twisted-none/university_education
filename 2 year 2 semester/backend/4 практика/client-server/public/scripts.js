// Глобальные переменные
let products = [];
let categories = [];
let currentCategory = 'all';
let chatSocket = null;

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  initChat();
  fetchProductsWithGraphQL();
});

// Функция для инициализации чата
function initChat() {
  // Создаем элементы чата
  const chatContainer = document.createElement('div');
  chatContainer.className = 'chat-container';
  chatContainer.innerHTML = `
    <div class="chat-header">
      <h3>Чат с поддержкой</h3>
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
  
  // Получаем ссылки на элементы
  const toggleChat = document.getElementById('toggle-chat');
  const chatBody = document.querySelector('.chat-body');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-message');
  
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
  chatSocket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);
  
  // Обработчик открытия соединения
  chatSocket.onopen = () => {
    console.log('WebSocket соединение установлено');
  };
  
  // Обработчик входящих сообщений
  chatSocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    addChatMessage(message);
  };
  
  // Обработчик ошибок
  chatSocket.onerror = (error) => {
    console.error('WebSocket ошибка:', error);
  };
  
  // Отправка сообщения
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
}

// Функция для добавления сообщения в чат
function addChatMessage(message) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.className = `chat-message ${message.userType}`;
  
  const timestamp = new Date(message.timestamp).toLocaleTimeString();
  
  messageElement.innerHTML = `
    <div class="message-header">
      <span class="message-user">${message.userType === 'admin' ? 'Администратор' : 'Вы'}</span>
      <span class="message-time">${timestamp}</span>
    </div>
    <div class="message-text">${message.message}</div>
  `;
  
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Функция для загрузки товаров с использованием GraphQL
async function fetchProductsWithGraphQL(categoryId = null) {
  try {
    // Определяем запрос GraphQL
    let query;
    let variables = {};
    
    if (categoryId && categoryId !== 'all') {
      // Запрос для товаров определенной категории
      query = `
        query ProductsByCategory($categoryId: String!) {
          productsByCategory(categoryId: $categoryId) {
            id
            name
            price
            description
          }
          categories {
            id
            name
          }
        }
      `;
      variables = { categoryId };
    } else {
      // Запрос для всех товаров
      query = `
        query {
          products {
            id
            name
            price
            description
            categories
          }
          categories {
            id
            name
          }
        }
      `;
    }
    
    // Отправляем GraphQL запрос
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    // Обрабатываем результаты запроса
    if (categoryId && categoryId !== 'all') {
      products = result.data.productsByCategory;
      categories = result.data.categories;
    } else {
      products = result.data.products;
      categories = result.data.categories;
    }
    
    renderCategories();
    renderProducts();
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    document.getElementById('products-container').innerHTML = 
      '<div class="error">Ошибка при загрузке товаров. Пожалуйста, попробуйте позже.</div>';
  }
}

// Функция для отображения категорий
function renderCategories() {
  const navElement = document.getElementById('categories-nav').querySelector('ul');
  
  // Очищаем текущие категории, оставляя только "Все товары"
  navElement.innerHTML = '<li><a href="#" data-category="all" class="active">Все товары</a></li>';
  
  // Добавляем категории из загруженных данных
  categories.forEach(category => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    
    link.textContent = category.name;
    link.setAttribute('href', '#');
    link.setAttribute('data-category', category.id);
    
    if (currentCategory === category.id) {
      link.classList.add('active');
    }
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Удаляем класс active со всех ссылок
      document.querySelectorAll('#categories-nav a').forEach(el => {
        el.classList.remove('active');
      });
      
      // Добавляем класс active на кликнутую ссылку
      e.target.classList.add('active');
      
      currentCategory = category.id;
      fetchProductsWithGraphQL(currentCategory);
    });
    
    listItem.appendChild(link);
    navElement.appendChild(listItem);
  });
  
  // Добавляем обработчик для "Все товары"
  document.querySelector('[data-category="all"]').addEventListener('click', (e) => {
    e.preventDefault();
    
    // Удаляем класс active со всех ссылок
    document.querySelectorAll('#categories-nav a').forEach(el => {
      el.classList.remove('active');
    });
    
    // Добавляем класс active на кликнутую ссылку
    e.target.classList.add('active');
    
    currentCategory = 'all';
    fetchProductsWithGraphQL();
  });
}

// Функция для отображения товаров
function renderProducts() {
  const container = document.getElementById('products-container');
  container.innerHTML = '';
  
  if (products.length === 0) {
    container.innerHTML = '<div class="no-products">Товары не найдены</div>';
    return;
  }
  
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Получаем названия категорий товара (если они загружены)
    let productCategoriesHTML = '';
    if (product.categories) {
      const productCategories = product.categories.map(catId => {
        const category = categories.find(c => c.id === catId);
        return category ? category.name : catId;
      });
      
      productCategoriesHTML = `
        <div class="product-categories">
          ${productCategories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
        </div>
      `;
    }
    
    card.innerHTML = `
      <div class="product-card-content">
        <h2>${product.name}</h2>
        <div class="price">${formatPrice(product.price)} ₽</div>
        <div class="description">${product.description}</div>
        ${productCategoriesHTML}
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Форматирование цены
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}