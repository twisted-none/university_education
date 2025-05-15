import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import HomePage from './components/Home/HomePage';
import RoadmapTree from './components/Roadmap/RoadmapTree';
import ConfigList from './components/ConfigLibrary/ConfigList';
import { AuthProvider, AuthContext } from './contexts/AuthProvider';
import './styles/global.css';

// Компонент защищенного маршрута
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Требуется авторизация</h2>
          <p className="mb-4">Авторизуйтесь через Telegram для доступа к приложению.</p>
        </div>
      </div>
    );
  }
  
  return children;
}

function AppContent() {
  const { user, loading } = useContext(AuthContext);
  const [activePage, setActivePage] = React.useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { telegramApp } = useContext(AuthContext);

  // Функция для изменения активной страницы
  const handlePageChange = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false); // Закрываем мобильное меню при переключении страницы
  };

  // Функция для переключения мобильного меню
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header 
        user={user} 
        toggleMobileMenu={toggleMobileMenu} 
        telegramApp={telegramApp}
      />
      
      <div className="flex flex-grow">
        {/* Сайдбар для десктопа */}
        <div className="hidden md:block">
          <Sidebar activePage={activePage} onPageChange={handlePageChange} />
        </div>
        
        {/* Мобильное меню */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
            <div className="w-64 h-full bg-purple-800 text-white">
              <div className="p-4 flex justify-end">
                <button onClick={toggleMobileMenu} className="text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <Sidebar activePage={activePage} onPageChange={handlePageChange} />
            </div>
          </div>
        )}
        
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage user={user} telegramApp={telegramApp} />
              </ProtectedRoute>
            } />
            <Route path="/home" element={
              <ProtectedRoute>
                <HomePage user={user} telegramApp={telegramApp} />
              </ProtectedRoute>
            } />
            <Route path="/roadmap" element={
              <ProtectedRoute>
                <RoadmapTree user={user} telegramApp={telegramApp} />
              </ProtectedRoute>
            } />
            <Route path="/configs" element={
              <ProtectedRoute>
                <ConfigList user={user} telegramApp={telegramApp} />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;