// Основной модуль приложения
const TodoApp = (() => {
    // Элементы DOM
    const todoForm = document.getElementById('todoForm');
    const todoInput = document.getElementById('todoInput');
    const todoList = document.getElementById('todoList');
    const todoCount = document.getElementById('todoCount');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const enableNotificationsBtn = document.getElementById('enableNotifications');
    const connectionStatus = document.getElementById('onlineStatus');
    
    // Текущий активный фильтр
    let currentFilter = 'all';
    
    // Инициализация приложения
    const init = () => {
        // Загрузка задач из БД
        renderTodos();
        
        // Добавление обработчиков событий
        todoForm.addEventListener('submit', handleTodoSubmit);
        todoList.addEventListener('click', handleTodoClick);
        clearCompletedBtn.addEventListener('click', handleClearCompleted);
        
        // Настройка фильтров
        filterButtons.forEach(btn => {
            btn.addEventListener('click', handleFilterChange);
        });
        
        // Настройка кнопки уведомлений
        if (enableNotificationsBtn) {
            updateNotificationButtonState();
            enableNotificationsBtn.addEventListener('click', handleEnableNotifications);
        }
        
        // Настройка мониторинга состояния сетевого подключения
        setupConnectionMonitoring();
        
        // Обновление счетчика задач
        updateTodoCount();
    };
    
    // Обработка отправки формы для добавления задачи
    const handleTodoSubmit = (e) => {
        e.preventDefault();
        
        const text = todoInput.value.trim();
        if (!text) return;
        
        // Добавление задачи в БД
        const newTodo = TodoDB.addTodo(text);
        
        // Отображение новой задачи если она соответствует текущему фильтру
        if (currentFilter === 'all' || currentFilter === 'active') {
            renderTodoItem(newTodo);
        }
        
        // Обновление счетчика задач
        updateTodoCount();
        
        // Очистка поля ввода
        todoInput.value = '';
        
        // Отправка уведомления о новой задаче
        if (NotificationManager.getNotificationPermissionStatus() === 'granted') {
            NotificationManager.sendNewTaskNotification(text);
        }
    };
    
    // Обработка клика по элементам задачи
    const handleTodoClick = (e) => {
        const todoItem = e.target.closest('.todo-item');
        if (!todoItem) return;
        
        const todoId = todoItem.dataset.id;
        
        // Клик по чекбоксу
        if (e.target.classList.contains('todo-checkbox')) {
            // Обновление статуса задачи в БД
            TodoDB.toggleTodoStatus(todoId);
            
            // Обновление вида задачи
            todoItem.classList.toggle('completed');
            
            // Если текущий фильтр не соответствует новому статусу, скрываем задачу
            if ((currentFilter === 'active' && todoItem.classList.contains('completed')) ||
                (currentFilter === 'completed' && !todoItem.classList.contains('completed'))) {
                todoItem.style.display = 'none';
            }
            
            // Обновление счетчика задач
            updateTodoCount();
        }
        
        // Клик по кнопке удаления
        if (e.target.classList.contains('delete-btn')) {
            // Удаление задачи из БД
            TodoDB.deleteTodo(todoId);
            
            // Удаление элемента из DOM
            todoItem.remove();
            
            // Обновление счетчика задач
            updateTodoCount();
        }
    };
    
    // Обработка клика по кнопке очистки выполненных задач
    const handleClearCompleted = () => {
        // Очистка выполненных задач в БД
        TodoDB.clearCompleted();
        
        // Удаление выполненных задач из DOM
        const completedItems = todoList.querySelectorAll('.todo-item.completed');
        completedItems.forEach(item => item.remove());
        
        // Обновление счетчика задач
        updateTodoCount();
    };
    
    // Обработка клика по кнопке фильтра
    const handleFilterChange = (e) => {
        // Обновление активного фильтра
        const filterBtn = e.target;
        const filter = filterBtn.dataset.filter;
        
        // Обновление активной кнопки
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        filterBtn.classList.add('active');
        
        // Сохранение текущего фильтра
        currentFilter = filter;
        
        // Применение фильтра
        applyFilter(filter);
    };
    
    // Обработка клика по кнопке включения уведомлений
    const handleEnableNotifications = async () => {
        // Запрос разрешения на уведомления
        const granted = await NotificationManager.requestNotificationPermission();
        
        // Обновление состояния кнопки
        updateNotificationButtonState();
        
        // Настройка периодических уведомлений, если разрешено
        if (granted) {
            NotificationManager.setupReminderNotifications();
        }
    };
    
    // Отображение задач из БД
    const renderTodos = () => {
        // Очистка списка
        todoList.innerHTML = '';
        
        // Получение задач в соответствии с текущим фильтром
        let todos;
        switch (currentFilter) {
            case 'active':
                todos = TodoDB.getActiveTodos();
                break;
            case 'completed':
                todos = TodoDB.getCompletedTodos();
                break;
            default:
                todos = TodoDB.getTodos();
        }
        
        // Отображение задач
        todos.forEach(todo => renderTodoItem(todo));
    };
    
    // Создание и отображение элемента задачи
    const renderTodoItem = (todo) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn">Удалить</button>
        `;
        
        todoList.appendChild(li);
    };
    
    // Экранирование HTML-тегов
    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };
    
    // Применение фильтра к отображаемым задачам
    const applyFilter = (filter) => {
        switch (filter) {
            case 'active':
                renderTodos();
                break;
            case 'completed':
                renderTodos();
                break;
            default:
                renderTodos();
        }
    };
    
    // Обновление счетчика активных задач
    const updateTodoCount = () => {
        const activeTodos = TodoDB.getActiveTodos();
        todoCount.textContent = `${activeTodos.length} задач осталось`;
    };
    
    // Настройка мониторинга состояния сетевого подключения
    const setupConnectionMonitoring = () => {
        // Функция обновления статуса соединения
        const updateConnectionStatus = () => {
            const isOnline = navigator.onLine;
            console.log("Проверка соединения. Онлайн:", isOnline);
            connectionStatus.textContent = isOnline ? 'Онлайн' : 'Офлайн';
            connectionStatus.style.color = isOnline ? '#4CAF50' : '#F44336';
        };
        
        // Инициализация статуса
        updateConnectionStatus();
        
        // Отслеживание изменений статуса
        window.addEventListener('online', () => {
            console.log("Событие online сработало");
            updateConnectionStatus();
        });
        window.addEventListener('offline', () => {
            console.log("Событие offline сработало");
            updateConnectionStatus();
        });
        
        // Добавляем регулярную проверку статуса
        setInterval(updateConnectionStatus, 5000); // проверка каждые 5 секунд
    };
    
    // Обновление состояния кнопки уведомлений
    const updateNotificationButtonState = () => {
        if (!NotificationManager.areNotificationsSupported()) {
            enableNotificationsBtn.textContent = 'Уведомления не поддерживаются';
            enableNotificationsBtn.disabled = true;
            return;
        }
        
        const permission = NotificationManager.getNotificationPermissionStatus();
        
        if (permission === 'granted') {
            enableNotificationsBtn.textContent = 'Уведомления включены';
            enableNotificationsBtn.style.backgroundColor = '#4CAF50';
        } else if (permission === 'denied') {
            enableNotificationsBtn.textContent = 'Уведомления заблокированы';
            enableNotificationsBtn.style.backgroundColor = '#F44336';
            enableNotificationsBtn.disabled = true;
        } else {
            enableNotificationsBtn.textContent = 'Включить уведомления';
        }
    };
    
    return {
        init
    };
})();

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    TodoApp.init();
});