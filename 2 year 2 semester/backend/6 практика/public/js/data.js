// Элементы DOM для профиля
const logoutBtn = document.getElementById('logout-btn');
const userInfoContainer = document.getElementById('user-info');
const dataContainer = document.getElementById('data-container');
const dataSourceLabel = document.getElementById('data-source');
const refreshDataBtn = document.getElementById('refresh-data');
const messageBox = document.getElementById('message-box');

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

// Получение информации о пользователе
async function loadUserInfo() {
  try {
    const response = await fetch('/user');
    
    if (!response.ok) {
      if (response.status === 401) {
        // Если пользователь не авторизован, перенаправляем на главную
        window.location.href = '/';
        return;
      }
      throw new Error('Ошибка получения данных пользователя');
    }
    
    const user = await response.json();
    
    // Отображаем информацию о пользователе
    userInfoContainer.innerHTML = `
      <div class="user-data">
        <p><strong>ID:</strong> ${user.id}</p>
        <p><strong>Имя пользователя:</strong> ${user.username}</p>
      </div>
    `;
  } catch (error) {
    userInfoContainer.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
  }
}

// Загрузка данных с сервера
async function loadData() {
  try {
    refreshDataBtn.disabled = true;
    refreshDataBtn.textContent = 'Загрузка...';
    dataContainer.innerHTML = '<p>Загрузка данных...</p>';
    
    const response = await fetch('/data');
    
    if (!response.ok) {
      if (response.status === 401) {
        // Если пользователь не авторизован, перенаправляем на главную
        window.location.href = '/';
        return;
      }
      throw new Error('Ошибка получения данных');
    }
    
    const result = await response.json();
    
    // Обновляем метку источника
    if (result.source === 'cache') {
      dataSourceLabel.textContent = 'Источник: Кэш';
    } else {
      dataSourceLabel.textContent = 'Источник: Сгенерировано';
    }
    
    // Отображаем данные
    const data = result.data;
    
    dataContainer.innerHTML = `
      <p><strong>Временная метка:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
      <p><strong>Случайное значение:</strong> ${data.randomValue.toFixed(6)}</p>
      
      <h3>Элементы</h3>
      <div class="item-cards">
        ${data.items.map(item => `
          <div class="item-card">
            <h4>${item.name}</h4>
            <p>ID: ${item.id}</p>
            <p>Значение: ${item.value}</p>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    dataContainer.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
  } finally {
    refreshDataBtn.disabled = false;
    refreshDataBtn.textContent = 'Обновить данные';
  }
}

// Выход из системы
async function logout() {
  try {
    const response = await fetch('/logout', {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при выходе из системы');
    }
    
    // Перенаправляем на главную страницу
    window.location.href = '/';
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// Добавляем обработчики событий
document.addEventListener('DOMContentLoaded', () => {
  loadUserInfo();
  
  // Обработчик кнопки выхода
  logoutBtn.addEventListener('click', logout);
  
  // Обработчик кнопки обновления данных
  refreshDataBtn.addEventListener('click', loadData);
});