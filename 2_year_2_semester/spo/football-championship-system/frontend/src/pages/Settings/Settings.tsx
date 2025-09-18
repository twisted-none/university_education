// frontend/src/pages/Settings/Settings.tsx

import React, { useState } from 'react';
import { User, Shield, Database, Save } from 'lucide-react';
// import { useTheme } from '@/context/ThemeContext'; // <-- ИСПРАВЛЕНИЕ: Эта строка удалена
import { useAuth } from '@/context/AuthContext'; // <-- используем абсолютный путь
import Button from '@/components/common/Button';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [accentColor] = useState('purple');
  const [settings, setSettings] = useState({
    profile: {
      username: user?.username || '',
      role: user?.role || 'manager'
    },
    system: {
      language: 'ru',
      timezone: 'UTC',
      dateFormat: 'DD/MM/YYYY',
      currency: 'USD'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90
    }
  });

  const tabs = [
    { id: 'profile', name: 'Профиль', icon: User },
    { id: 'system', name: 'Система', icon: Database },
    { id: 'security', name: 'Безопасность', icon: Shield }
  ];

  const accentColors = [
    { name: 'cyan', from: 'from-cyan-500', to: 'to-blue-600', border: 'border-cyan-500', ring: 'ring-cyan-500' },
    { name: 'green', from: 'from-green-500', to: 'to-emerald-600', border: 'border-green-500', ring: 'ring-green-500' },
    { name: 'purple', from: 'from-purple-500', to: 'to-pink-600', border: 'border-purple-500', ring: 'ring-purple-500' },
    { name: 'orange', from: 'from-orange-500', to: 'to-red-600', border: 'border-orange-500', ring: 'ring-orange-500' }
  ];

  const roleLabels = {
    manager: 'Менеджер',
    admin: 'Администратор',
    user: 'Пользователь'
  };

  const handleSave = () => {
    console.log('Сохранение настроек:', settings, 'Акцентный цвет:', accentColor);
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const getAccentClasses = (colorName: string) => {
    const color = accentColors.find(c => c.name === colorName);
    return color || accentColors[0];
  };

  const currentAccent = getAccentClasses(accentColor);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Настройки</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Управление аккаунтом и системными настройками
          </p>
        </div>
        <Button
          variant="primary"
          icon={Save}
          onClick={handleSave}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25"
        >
          Сохранить изменения
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${currentAccent.from}/10 ${currentAccent.to}/10 border ${currentAccent.border}/20 text-${accentColor}-600 dark:text-${accentColor}-400`
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? `text-${accentColor}-500` : ''}`} />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Настройки профиля</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Имя пользователя
                    </label>
                    <input
                      type="text"
                      value={settings.profile.username}
                      onChange={(e) => updateSetting('profile', 'username', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:${currentAccent.ring}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Роль
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400">
                      {roleLabels[settings.profile.role as keyof typeof roleLabels] || settings.profile.role}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Роль назначается администратором
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Системные настройки</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Язык
                    </label>
                    <select
                      value={settings.system.language}
                      onChange={(e) => updateSetting('system', 'language', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:${currentAccent.ring}`}
                    >
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Часовой пояс
                    </label>
                    <select
                      value={settings.system.timezone}
                      onChange={(e) => updateSetting('system', 'timezone', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:${currentAccent.ring}`}
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Восточное время</option>
                      <option value="PST">Тихоокеанское время</option>
                      <option value="CET">Центральноевропейское время</option>
                      <option value="MSK">Московское время</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Формат даты
                    </label>
                    <select
                      value={settings.system.dateFormat}
                      onChange={(e) => updateSetting('system', 'dateFormat', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:${currentAccent.ring}`}
                    >
                      <option value="DD/MM/YYYY">ДД/ММ/ГГГГ</option>
                      <option value="MM/DD/YYYY">ММ/ДД/ГГГГ</option>
                      <option value="YYYY-MM-DD">ГГГГ-ММ-ДД</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Валюта
                    </label>
                    <select
                      value={settings.system.currency}
                      onChange={(e) => updateSetting('system', 'currency', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:${currentAccent.ring}`}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="RUB">RUB (₽)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Настройки безопасности</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Двухфакторная аутентификация</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Дополнительная защита вашего аккаунта
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:${currentAccent.ring}/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-${accentColor}-600`}></div>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Таймаут сессии (минуты)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:${currentAccent.ring}`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Срок действия пароля (дни)
                      </label>
                      <input
                        type="number"
                        value={settings.security.passwordExpiry}
                        onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value))}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:${currentAccent.ring}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;