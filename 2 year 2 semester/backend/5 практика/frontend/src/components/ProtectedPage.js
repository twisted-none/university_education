// frontend/src/components/ProtectedPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProtectedPage({ token }) {
  const [protectedData, setProtectedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/protected', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProtectedData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Не удалось загрузить защищенные данные');
      }
    };

    fetchProtectedData();
  }, [token]);

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-4 text-center">Защищенные данные</h2>
        {protectedData ? (
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-bold mb-2">Сообщение:</h3>
              <p>{protectedData.message}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-bold mb-2">Пользователь:</h3>
              <p>{protectedData.user.username}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded break-words">
              <h3 className="font-bold mb-2">JWT Токен:</h3>
              <p className="text-sm">{token}</p>
            </div>
          </div>
        ) : (
          <p className="text-center">Загрузка...</p>
        )}
      </div>
    </div>
  );
}

export default ProtectedPage;