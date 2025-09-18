// frontend/src/pages/Login.tsx

import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // <-- путь '../' правильный
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading: isAuthLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await login({ username, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl mb-4 shadow-lg shadow-cyan-500/25">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Войти в аккаунт</h1>
          <p className="text-gray-300">Войдите в систему менеджмента</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (<div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl"><p className="text-red-300 text-sm text-center">{error}</p></div>)}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Введите имя пользователя" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-12" placeholder="Введите пароль" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting || isAuthLoading} icon={LogIn} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
            {isSubmitting || isAuthLoading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
        <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">Ещё нет аккаунта?{' '}<button onClick={() => navigate('/register')} className="text-cyan-400 hover:text-cyan-300 font-medium">Создайте его здесь</button></p>
        </div>
      </div>
    </div>
  );
};
export default Login;