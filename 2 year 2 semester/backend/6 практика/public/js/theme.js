// Элементы DOM для управления темой
const themeToggle = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-label');
const themeCss = document.getElementById('theme-css');

// Проверяем сохраненную тему в localStorage
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  if (savedTheme === 'dark') {
    themeToggle.checked = true;
    themeCss.href = '/css/dark.css';
    themeLabel.textContent = 'Темная тема';
  } else {
    themeToggle.checked = false;
    themeCss.href = '/css/light.css';
    themeLabel.textContent = 'Светлая тема';
  }
}

// Изменение темы при переключении
themeToggle.addEventListener('change', () => {
  if (themeToggle.checked) {
    // Включаем темную тему
    themeCss.href = '/css/dark.css';
    themeLabel.textContent = 'Темная тема';
    localStorage.setItem('theme', 'dark');
  } else {
    // Включаем светлую тему
    themeCss.href = '/css/light.css';
    themeLabel.textContent = 'Светлая тема';
    localStorage.setItem('theme', 'light');
  }
});

// Загружаем тему при загрузке страницы
document.addEventListener('DOMContentLoaded', loadTheme);