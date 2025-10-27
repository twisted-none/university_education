// frontend/src/components/DefectsPage.js

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import './DefectsPage.css';
import DefectDetailsModal from './DefectDetailsModal';

// --- Константы для выпадающих списков ---
const PRIORITY_OPTIONS = ["Низкий", "Средний", "Высокий", "Критический"];
const STATUS_OPTIONS_MANAGER = ["Новая", "В работе", "На проверке", "Закрыта", "Переоткрыта"];
const STATUS_OPTIONS_ENGINEER = ["В работе", "На проверке", "Закрыта", "Переоткрыта"];

// ====================================================
// Вспомогательный компонент для одной карточки дефекта
// ====================================================

const DefectCard = ({ defect, engineers, currentUserId, currentUserRole, loadDefects, setError, onDefectClick }) => {
    const isManager = currentUserRole === 'Менеджер' || currentUserRole === 'Руководитель';
    const isEngineer = currentUserRole === 'Инженер';
    const isAssignedEngineer = isEngineer && defect.executor_id === currentUserId;
    
    const canEditStatus = isManager || isAssignedEngineer;
    const canAssignExecutor = isManager;
    const canEditPriority = isManager;

    const getStatusOptions = () => {
        return isManager ? STATUS_OPTIONS_MANAGER : STATUS_OPTIONS_ENGINEER;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Не установлен';
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            await api.updateDefect(defect.id, { status: newStatus });
            loadDefects();
            setError('');
        } catch (err) {
            setError(`Ошибка при обновлении статуса: ${err.message}`);
        }
    };
    
    const handleExecutorChange = async (e) => {
        const newExecutorId = e.target.value === '' ? null : parseInt(e.target.value);
        try {
            await api.updateDefect(defect.id, { executor_id: newExecutorId });
            loadDefects();
            setError('');
        } catch (err) {
            setError(`Ошибка при назначении исполнителя: ${err.message}`);
        }
    };
    
    const handlePriorityChange = async (e) => {
        const newPriority = e.target.value;
        try {
            await api.updateDefect(defect.id, { priority: newPriority });
            loadDefects();
            setError('');
        } catch (err) {
            setError(`Ошибка при изменении приоритета: ${err.message}`);
        }
    };

    return (
        <div className="defect-card" onClick={() => onDefectClick(defect.id)}>
            <div className="defect-header">
                <span className="defect-title">#{defect.id} {defect.title}</span>
                <div className="defect-controls" onClick={e => e.stopPropagation()}>
                    {canEditStatus ? (
                        <select 
                            value={defect.status} 
                            onChange={handleStatusChange}
                            className={`status-select status-${defect.status.toLowerCase().replace(' ', '-')}`}
                        >
                            {getStatusOptions().map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    ) : (
                        <span className={`defect-status status-${defect.status.toLowerCase().replace(' ', '-')}`}>{defect.status}</span>
                    )}

                    {canEditPriority ? (
                        <select 
                            value={defect.priority} 
                            onChange={handlePriorityChange}
                            className={`priority-select priority-${defect.priority.toLowerCase()}`}
                        >
                            {PRIORITY_OPTIONS.map(priority => (
                                <option key={priority} value={priority}>{priority}</option>
                            ))}
                        </select>
                    ) : (
                        <span className={`defect-priority priority-${defect.priority.toLowerCase()}`}>{defect.priority}</span>
                    )}
                </div>
            </div>
            
            <p className="defect-description-short">
                {defect.description.length > 100 
                    ? `${defect.description.substring(0, 100)}...` 
                    : defect.description
                }
            </p>

            <div className="defect-footer">
                <div className="user-info">
                    <span className="creator">
                        <strong>Создатель:</strong> {defect.creator?.username || 'N/A'}
                    </span>
                    
                    {canAssignExecutor ? (
                        <select 
                            value={defect.executor_id || ''} 
                            onChange={handleExecutorChange}
                            className="executor-select"
                            onClick={e => e.stopPropagation()}
                        >
                            <option value="">Исполнитель: Не назначен</option>
                            {engineers.map(user => (
                                <option key={user.id} value={user.id}>Исполнитель: {user.username}</option>
                            ))}
                        </select>
                    ) : (
                        <span className="executor">
                            <strong>Исполнитель:</strong> {defect.executor?.username || 'Не назначен'}
                        </span>
                    )}
                </div>

                <div className="date-info">
                    <span className="due-date">
                        <strong>Срок:</strong> {formatDate(defect.due_date)}
                    </span>
                </div>
            </div>
        </div>
    );
};

// ====================================================
// Основной компонент DefectsPage
// ====================================================

const DefectsPage = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [defects, setDefects] = useState([]);
    const [engineers, setEngineers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedDefectId, setSelectedDefectId] = useState(null);

    // ИСПРАВЛЕНИЕ: Правильная проверка роли для создания дефекта
    // Только Менеджер может создавать дефекты, Инженер - НЕТ
    const canCreateDefect = auth.user?.role === 'Менеджер';
    const canAssignExecutor = auth.user?.role === 'Менеджер';

    const [newDefect, setNewDefect] = useState({
        title: '',
        description: '',
        priority: PRIORITY_OPTIONS[1],
        due_date: '',
        executor_id: ''
    });

    const loadDefects = async () => {
        setLoading(true);
        setError('');
        try {
            const defectsData = await api.getDefects();
            setDefects(defectsData);
        } catch (err) {
            setError('Ошибка загрузки дефектов: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadEngineers = async () => {
        try {
            const engineersData = await api.getEngineers();
            setEngineers(engineersData);
        } catch (err) {
            console.error('Ошибка загрузки инженеров:', err.message);
            // Не показываем ошибку пользователю, так как инженерам не нужен этот список
        }
    };

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
        loadDefects();
        // Загружаем инженеров только если пользователь - менеджер
        if (auth.user?.role === 'Менеджер') {
            loadEngineers();
        }
    }, [auth.isAuthenticated, navigate, auth.user?.role]);

    const handleCreateDefect = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const dataToSend = {
            ...newDefect,
            executor_id: newDefect.executor_id ? parseInt(newDefect.executor_id) : null,
            due_date: newDefect.due_date || null
        };
        
        try {
            await api.createDefect(dataToSend);
            setShowCreateForm(false);
            setNewDefect({
                title: '',
                description: '',
                priority: PRIORITY_OPTIONS[1],
                due_date: '',
                executor_id: ''
            });
            await loadDefects();
        } catch (err) {
            setError(`Ошибка создания дефекта: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDefectClick = (defectId) => {
        setSelectedDefectId(defectId);
    };

    const handleCloseModal = () => {
        setSelectedDefectId(null);
        loadDefects();
    };

    return (
        <div className="defects-container">
            <header className="defects-header">
                <h1>Система Отслеживания Дефектов</h1>
                <div className="header-controls">
                    {/* ИСПРАВЛЕНИЕ: Кнопка "Создать Дефект" показывается только менеджерам */}
                    {canCreateDefect && (
                        <button 
                            className="btn-secondary" 
                            onClick={() => setShowCreateForm(!showCreateForm)}
                        >
                            {showCreateForm ? 'Скрыть Форму' : 'Создать Дефект'}
                        </button>
                    )}
                    <button className="btn-secondary" onClick={auth.logout}>Выход</button>
                </div>
            </header>
            
            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-message">Загрузка дефектов...</div>}

            {/* Форма создания дефекта - показывается только менеджерам */}
            {showCreateForm && canCreateDefect && (
                <form onSubmit={handleCreateDefect} className="create-defect-form">
                    <h3>Новый Дефект</h3>
                    <div className="form-grid">
                        <input
                            type="text"
                            placeholder="Заголовок"
                            value={newDefect.title}
                            onChange={(e) => setNewDefect({...newDefect, title: e.target.value})}
                            required
                        />
                        <textarea
                            placeholder="Описание"
                            value={newDefect.description}
                            onChange={(e) => setNewDefect({...newDefect, description: e.target.value})}
                            required
                        />
                        <select
                            value={newDefect.priority}
                            onChange={(e) => setNewDefect({...newDefect, priority: e.target.value})}
                            required
                        >
                            {PRIORITY_OPTIONS.map(priority => (
                                <option key={priority} value={priority}>Приоритет: {priority}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={newDefect.due_date}
                            onChange={(e) => setNewDefect({...newDefect, due_date: e.target.value})}
                            placeholder="Срок (Опционально)"
                        />
                        {canAssignExecutor && (
                            <select
                                value={newDefect.executor_id || ''}
                                onChange={(e) => setNewDefect({...newDefect, executor_id: e.target.value})}
                            >
                                <option value="">Назначить исполнителя (Опционально)</option>
                                {engineers.map(user => (
                                    <option key={user.id} value={user.id}>{user.username} ({user.role})</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        Создать Дефект
                    </button>
                </form>
            )}

            {/* Список дефектов */}
            <div className="defects-list">
                {defects.length === 0 && !loading && !error ? (
                    <div className="no-defects">
                        {canCreateDefect ? 'Дефектов не найдено. Создайте первый дефект.' : 'Дефектов не найдено.'}
                    </div>
                ) : (
                    defects.map(defect => (
                        <DefectCard 
                            key={defect.id} 
                            defect={defect} 
                            engineers={engineers} 
                            currentUserId={auth.user?.id} 
                            currentUserRole={auth.user?.role} 
                            loadDefects={loadDefects}
                            setError={setError}
                            onDefectClick={handleDefectClick}
                        />
                    ))
                )}
            </div>

            {/* Модальное окно деталей дефекта */}
            {selectedDefectId && (
                <DefectDetailsModal 
                    defectId={selectedDefectId} 
                    onClose={handleCloseModal}
                    loadDefects={loadDefects}
                />
            )}
        </div>
    );
};

export default DefectsPage;