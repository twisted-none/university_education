// Модуль для работы с данными в localStorage
const TodoDB = (() => {
    const DB_NAME = 'smart-todo-db';
    
    // Получение всех задач
    const getTodos = () => {
        const todos = localStorage.getItem(DB_NAME);
        return todos ? JSON.parse(todos) : [];
    };
    
    // Сохранение всех задач
    const saveTodos = (todos) => {
        localStorage.setItem(DB_NAME, JSON.stringify(todos));
    };
    
    // Добавление новой задачи
    const addTodo = (text) => {
        const todos = getTodos();
        const newTodo = {
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        todos.push(newTodo);
        saveTodos(todos);
        return newTodo;
    };
    
    // Удаление задачи по ID
    const deleteTodo = (id) => {
        const todos = getTodos();
        const filteredTodos = todos.filter(todo => todo.id !== id);
        saveTodos(filteredTodos);
        return filteredTodos;
    };
    
    // Обновление статуса задачи
    const toggleTodoStatus = (id) => {
        const todos = getTodos();
        const updatedTodos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveTodos(updatedTodos);
        return updatedTodos;
    };
    
    // Очистка выполненных задач
    const clearCompleted = () => {
        const todos = getTodos();
        const activeTodos = todos.filter(todo => !todo.completed);
        saveTodos(activeTodos);
        return activeTodos;
    };
    
    // Получение активных задач
    const getActiveTodos = () => {
        return getTodos().filter(todo => !todo.completed);
    };
    
    // Получение выполненных задач
    const getCompletedTodos = () => {
        return getTodos().filter(todo => todo.completed);
    };
    
    // Обновление текста задачи
    const updateTodoText = (id, newText) => {
        const todos = getTodos();
        const updatedTodos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, text: newText };
            }
            return todo;
        });
        saveTodos(updatedTodos);
        return updatedTodos;
    };
    
    return {
        getTodos,
        addTodo,
        deleteTodo,
        toggleTodoStatus,
        clearCompleted,
        getActiveTodos,
        getCompletedTodos,
        updateTodoText
    };
})();