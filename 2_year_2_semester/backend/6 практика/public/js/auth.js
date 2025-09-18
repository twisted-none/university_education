// Элементы DOM для авторизации
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const messageBox = document.getElementById('message-box');

// Переключение между вкладками
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    
    // Активируем кнопку вкладки
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Показываем содержимое вкладки
    tabContents.forEach(content => {
      content.classList.add('hidden');
      if (content.id === `${tabId}-tab`) {
        content.classList.remove('hidden');
      }
    });
    
    // Очищаем сообщение при переключении вкладок
    messageBox.classList.remove('success', 'error');
    messageBox.style.display = 'none';
    messageBox.textContent = '';
  });
});

// Функция для отображения сообщений
function showMessage(message, type = 'success') {
  messageBox.textContent = message;
  messageBox.classList.remove('success', 'error');
  messageBox.classList.add(type);
  messageBox.style.display = 'block';
  
  // Автоматически скрываем сообщение через 5 секунд
  setTimeout(() => {
    messageBox.style.display = 'none';
  }, 5000);
}

// Обработка формы входа
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  
  if (!username || !password) {
    return showMessage('Пожалуйста, заполните все поля', 'error');
  }
  
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка входа');
    }
    
    // Успешный вход
    showMessage('Вход выполнен успешно! Перенаправление...');
    
    // Перенаправляем на страницу профиля после успешного входа
    setTimeout(() => {
      window.location.href = '/profile';
    }, 1000);
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

// Обработка формы регистрации
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;
  const passwordConfirm = document.getElementById('register-password-confirm').value;
  
  // Проверка данных
  if (!username || !password || !passwordConfirm) {
    return showMessage('Пожалуйста, заполните все поля', 'error');
  }
  
  if (username.length < 3) {
    return showMessage('Имя пользователя должно содержать не менее 3 символов', 'error');
  }
  
  if (password.length < 6) {
    return showMessage('Пароль должен содержать не менее 6 символов', 'error');
  }
  
  if (password !== passwordConfirm) {
    return showMessage('Пароли не совпадают', 'error');
  }
  
  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка регистрации');
    }
    
    // Успешная регистрация
    showMessage('Регистрация выполнена успешно! Перенаправление...');
    
    // Перенаправляем на страницу профиля после успешной регистрации
    setTimeout(() => {
      window.location.href = '/profile';
    }, 1000);
  } catch (error) {
    showMessage(error.message, 'error');
  }
});