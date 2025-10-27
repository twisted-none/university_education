// frontend/src/components/DefectDetailsModal.js

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../App';
import './DefectDetailsModal.css'; // Создайте этот файл стилей

// Хелпер для форматирования даты
const formatDate = (dateString) => {
    if (!dateString) return 'Нет';
    return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Компонент для отображения одного комментария
const CommentItem = ({ comment }) => (
    <div className="comment-item">
        <div className="comment-header">
            <span className="comment-author">
                {comment.author ? comment.author.username : 'Неизвестный'}
            </span>
            <span className="comment-date">
                {formatDate(comment.created_at)}
            </span>
        </div>
        <p className="comment-content">{comment.content}</p>
    </div>
);


const DefectDetailsModal = ({ defectId, onClose, loadDefects }) => {
    const auth = useAuth();
    const [defect, setDefect] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');

    // --- Загрузка деталей дефекта ---
    const loadDefectDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getDefectDetails(defectId);
            setDefect(data);
        } catch (err) {
            setError('Не удалось загрузить детали дефекта: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDefectDetails();
    }, [defectId]);

    // --- Добавление комментария ---
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await api.addComment(defectId, newComment.trim());
            setNewComment('');
            
            // Перезагрузка деталей, чтобы увидеть новый комментарий
            await loadDefectDetails();
            // Обновление списка на главной странице, если нужно (например, для счетчика комментов)
            loadDefects(); 

        } catch (err) {
            setError('Не удалось добавить комментарий: ' + err.message);
        }
    };

    if (loading) return <div className="modal-overlay"><div className="modal-content">Загрузка...</div></div>;
    if (error) return <div className="modal-overlay"><div className="modal-content">Ошибка: {error}</div></div>;
    if (!defect) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                
                <h2>Дефект #{defect.id}: {defect.title}</h2>
                <div className="defect-info-grid">
                    <p><strong>Статус:</strong> <span className={`status-${defect.status.toLowerCase().replace(' ', '-')}`}>{defect.status}</span></p>
                    <p><strong>Приоритет:</strong> <span className={`priority-${defect.priority.toLowerCase()}`}>{defect.priority}</span></p>
                    <p><strong>Создатель:</strong> {defect.creator?.username || 'N/A'}</p>
                    <p><strong>Исполнитель:</strong> {defect.executor?.username || 'Не назначен'}</p>
                    <p><strong>Срок:</strong> {defect.due_date ? formatDate(defect.due_date) : 'Не установлен'}</p>
                </div>
                
                <h3>Описание</h3>
                <p className="defect-description">{defect.description}</p>
                
                
                {/* --- Секция Комментариев --- */}
                <div className="comments-section">
                    <h3>Комментарии ({defect.comments.length})</h3>
                    <div className="comments-list">
                        {defect.comments.length === 0 
                            ? <p className="no-comments">Пока нет комментариев.</p>
                            : defect.comments.map(comment => (
                                <CommentItem key={comment.id} comment={comment} />
                            ))
                        }
                    </div>
                    
                    {/* Форма для добавления комментария */}
                    <form onSubmit={handleAddComment} className="add-comment-form">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Напишите комментарий..."
                            rows="3"
                            required
                        />
                        <button type="submit" className="btn-secondary">Добавить Комментарий</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DefectDetailsModal;