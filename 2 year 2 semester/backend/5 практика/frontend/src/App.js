import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [view, setView] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (receivedToken) => {
    setToken(receivedToken);
    localStorage.setItem('token', receivedToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const renderContent = () => {
    if (!token) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          {view === 'login' ? (
            <Login 
              onLogin={handleLogin} 
              onRegisterClick={() => setView('register')} 
            />
          ) : (
            <Register 
              onRegisterSuccess={() => setView('login')} 
              onLoginClick={() => setView('login')} 
            />
          )}
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-4">Вы авторизованы</h2>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Выйти
        </button>
      </div>
    );
  };

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
}

export default App;