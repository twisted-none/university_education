import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Мы создадим этот файл следующим

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);