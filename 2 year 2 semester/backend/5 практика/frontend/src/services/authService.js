import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const register = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { username, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Ошибка регистрации');
  }
};

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data.token;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Ошибка входа');
  }
};