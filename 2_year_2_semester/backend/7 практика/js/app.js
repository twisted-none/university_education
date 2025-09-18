// Обработчики событий и основная логика приложения

// Отображение всех заметок
function displayNotes() {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';

    getAllNotes((notes) => {
        if (notes.length === 0) {
            notesList.innerHTML = `
                <div class="empty-state">
                    <p>У вас пока нет заметок</p>
                </div>
            `;
            return;
        }

        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            
            const date = new Date(note.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            noteCard.innerHTML = `
                <div class="note-timestamp">${formattedDate}</div>
                <div class="note-content">${note.text}</div>
                <div class="note-actions">
                    <button class="edit-btn" data-id="${note.id}">Редактировать</button>
                    <button class="delete-btn" data-id="${note.id}">Удалить</button>
                </div>
            `;
            
            notesList.appendChild(noteCard);
        });
    });
}

// Добавление новой заметки
function addNote() {
    const noteText = document.getElementById('note-text').value.trim();
    if (!noteText) return;

    addNoteToDb(noteText, () => {
        document.getElementById('note-text').value = '';
        displayNotes();
    });
}

// Удаление заметки
function deleteNote(id) {
    if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
        deleteNoteFromDb(id, displayNotes);
    }
}

// Открытие модального окна для редактирования
function openEditModal(id) {
    getNoteById(id, (note) => {
        if (note) {
            document.getElementById('edit-note-text').value = note.text;
            document.getElementById('edit-note-id').value = note.id;
            document.getElementById('modal').style.display = 'flex';
        }
    });
}

// Сохранение отредактированной заметки
function saveEditedNote() {
    const id = parseInt(document.getElementById('edit-note-id').value);
    const text = document.getElementById('edit-note-text').value.trim();
    
    if (!text) return;

    updateNoteInDb(id, text, () => {
        closeModal();
        displayNotes();
    });
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Проверка сетевого соединения
function updateOnlineStatus() {
    const indicator = document.getElementById('offline-indicator');
    if (navigator.onLine) {
        indicator.style.display = 'none';
    } else {
        indicator.style.display = 'block';
    }
}

// Регистрация Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker зарегистрирован:', reg))
            .catch(err => console.log('Service Worker не зарегистрирован:', err));
    }
}

// Добавление обработчиков событий
document.addEventListener('DOMContentLoaded', function() {
    // Кнопки и элементы управления
    document.getElementById('add-note').addEventListener('click', addNote);
    
    document.getElementById('notes-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            deleteNote(parseInt(e.target.dataset.id));
        } else if (e.target.classList.contains('edit-btn')) {
            openEditModal(parseInt(e.target.dataset.id));
        }
    });
    
    document.getElementById('save-edit').addEventListener('click', saveEditedNote);
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Обработка нажатия Enter в поле ввода
    document.getElementById('note-text').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addNote();
        }
    });
    
    // Отслеживание статуса соединения
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Первичная проверка статуса соединения
    updateOnlineStatus();
    
    // Регистрация Service Worker
    registerServiceWorker();
});

// Логика отображения кнопки установки PWA
let deferredPrompt;
const installContainer = document.createElement('div');
installContainer.className = 'install-container';
installContainer.style.display = 'none';
installContainer.innerHTML = `
  <div class="install-banner">
    <p>Установите приложение для работы без интернета</p>
    <button id="install-button">Установить</button>
  </div>
`;
document.body.appendChild(installContainer);

// Стили для кнопки установки
const style = document.createElement('style');
style.textContent = `
  .install-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    padding: 10px;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
  }
  .install-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 800px;
    margin: 0 auto;
  }
  #install-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
`;
document.head.appendChild(style);

// Обработка события beforeinstallprompt (происходит, когда PWA доступно для установки)
window.addEventListener('beforeinstallprompt', (e) => {
  // Предотвращаем стандартное отображение подсказки в браузере
  e.preventDefault();
  // Сохраняем событие для использования позже
  deferredPrompt = e;
  // Показываем собственную кнопку установки
  installContainer.style.display = 'block';
});

// Обработчик нажатия на кнопку установки
document.getElementById('install-button').addEventListener('click', async () => {
  if (!deferredPrompt) {
    return;
  }
  // Показываем запрос на установку
  deferredPrompt.prompt();
  // Ждём результат
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Результат установки: ${outcome}`);
  // Обнуляем сохранённое событие - оно может использоваться только один раз
  deferredPrompt = null;
  // Скрываем кнопку
  installContainer.style.display = 'none';
});

// Скрываем кнопку установки, если приложение уже установлено
window.addEventListener('appinstalled', () => {
  console.log('PWA было установлено');
  deferredPrompt = null;
  installContainer.style.display = 'none';
});