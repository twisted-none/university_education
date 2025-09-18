// База данных IndexedDB
let db;
const DB_NAME = 'notes-app';
const STORE_NAME = 'notes';

// Инициализация IndexedDB
function initDatabase() {
    // Проверка поддержки IndexedDB
    if (!window.indexedDB) {
        console.log("Ваш браузер не поддерживает IndexedDB. Будет использован localStorage");
        return;
    }
    
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = (event) => {
        console.error("Ошибка открытия базы данных:", event.target.errorCode);
        alert("Ошибка доступа к хранилищу. Проверьте настройки приватности браузера.");
    };
    
    request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            store.createIndex('timestamp', 'timestamp', { unique: false });
        }
    };
    
    request.onsuccess = (event) => {
        db = event.target.result;
        // После успешного открытия БД отображаем заметки
        displayNotes();
    };
}

// Добавление заметки в базу данных
function addNoteToDb(noteText, callback) {
    if (!noteText) return;

    const note = {
        text: noteText,
        timestamp: new Date().toISOString()
    };

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(note);

    request.onsuccess = () => {
        if (callback) callback();
    };

    request.onerror = (event) => {
        console.error("Ошибка при добавлении заметки:", event.target.error);
    };
}

// Получение всех заметок из базы данных
function getAllNotes(callback) {
    const notes = [];
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev'); // Сортировка по убыванию даты

    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            notes.push(cursor.value);
            cursor.continue();
        } else {
            callback(notes);
        }
    };

    request.onerror = (event) => {
        console.error("Ошибка при получении заметок:", event.target.error);
        callback([]);
    };
}

// Удаление заметки из базы данных
function deleteNoteFromDb(id, callback) {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
        if (callback) callback();
    };

    request.onerror = (event) => {
        console.error("Ошибка при удалении заметки:", event.target.error);
    };
}

// Получение заметки по ID
function getNoteById(id, callback) {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = (event) => {
        callback(event.target.result);
    };

    request.onerror = (event) => {
        console.error("Ошибка при получении заметки:", event.target.error);
        callback(null);
    };
}

// Обновление заметки
function updateNoteInDb(id, text, callback) {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = (event) => {
        const note = event.target.result;
        note.text = text;
        note.timestamp = new Date().toISOString(); // Обновляем временную метку
        
        const updateRequest = store.put(note);
        
        updateRequest.onsuccess = () => {
            if (callback) callback();
        };

        updateRequest.onerror = (event) => {
            console.error("Ошибка при обновлении заметки:", event.target.error);
        };
    };

    request.onerror = (event) => {
        console.error("Ошибка при получении заметки для обновления:", event.target.error);
    };
}

// Инициализация базы данных при загрузке
document.addEventListener('DOMContentLoaded', initDatabase);