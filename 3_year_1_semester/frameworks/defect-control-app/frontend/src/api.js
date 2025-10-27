// frontend/src/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://176.108.255.248:8000';
export const API_URL = `${API_BASE_URL}`;

// Хелпер для получения заголовков авторизации
const getAuthHeaders = (contentType = 'application/json') => {
    const token = localStorage.getItem('userToken');
    const headers = {};
    
    if (contentType) {
        headers['Content-Type'] = contentType;
    }
    
    if (token) {
        // Обязательно кодируем токен, если он содержит кириллицу (username)
        const encodedToken = encodeURIComponent(token);
        headers['Authorization'] = `Bearer ${encodedToken}`;
    }
    return headers;
};


export const api = {
  
  // --- ЭНДПОИНТ ДЛЯ ЛОГИНА ---
  async login(username, password) {
    const formBody = new URLSearchParams();
    formBody.append('username', username);
    formBody.append('password', password);

    const response = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to log in: ${response.status}`);
    }

    return response.json();
  },

  // --- ПОЛУЧЕНИЕ СПИСКА ДЕФЕКТОВ ---
  async getDefects() {
    const response = await fetch(`${API_URL}/defects/`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to load defects: ${response.status}`);
    }
    
    return response.json();
  },

  // --- СОЗДАНИЕ ДЕФЕКТА ---
  async createDefect(defectData) {
    const response = await fetch(`${API_URL}/defects/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(defectData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to create defect: ${response.status}`);
    }
    
    return response.json();
  },
  
  // --- ОБНОВЛЕНИЕ ДЕФЕКТА (PATCH) ---
  async updateDefect(defectId, updateData) {
    const response = await fetch(`${API_URL}/defects/${defectId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to update defect: ${response.status}`);
    }

    return response.json();
  },
  
  // --- ПОЛУЧЕНИЕ СПИСКА ИНЖЕНЕРОВ ---
  async getEngineers() {
      const response = await fetch(`${API_URL}/users/engineers`, {
          headers: getAuthHeaders(null),
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to load engineers: ${response.status}`);
      }

      return response.json();
  },

  // --- НОВОЕ: Получение деталей дефекта ---
  async getDefectDetails(defectId) {
    const response = await fetch(`${API_URL}/defects/${defectId}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to load defect details: ${response.status}`);
    }

    return response.json();
  },

  // --- НОВОЕ: Добавление комментария ---
  async addComment(defectId, content) {
    const response = await fetch(`${API_URL}/defects/${defectId}/comments/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to add comment: ${response.status}`);
    }

    return response.json();
  },
  
  // ... (любые другие функции, которые могут быть в вашем api.js, оставлены без изменений)
  async getUsers() {
    const response = await fetch(`${API_URL}/users/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to load users: ${response.status}`);
    }

    return response.json();
  },

};