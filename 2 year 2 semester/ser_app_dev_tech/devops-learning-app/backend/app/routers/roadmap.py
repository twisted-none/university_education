from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
import json
import os

from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user

router = APIRouter()

# Функция для рекурсивного построения дерева roadmap с информацией о прогрессе пользователя
def build_roadmap_tree(nodes, parent_id, user_progress):
    tree = []
    for node in [n for n in nodes if n.parent_id == parent_id]:
        # Получение информации о прогрессе для текущего узла
        progress = next((p for p in user_progress if p.node_id == node.id), None)
        
        # Создание модели с прогрессом
        node_with_progress = schemas.RoadmapNodeWithProgress(
            id=node.id,
            title=node.title,
            description=node.description,
            parent_id=node.parent_id,
            order=node.order,
            meta_data=json.loads(node.meta_data) if node.meta_data else {},
            children=[],
            progress={"is_completed": progress.is_completed, "updated_at": progress.updated_at} if progress else None
        )
        
        # Рекурсивное построение дочерних узлов
        node_with_progress.children = build_roadmap_tree(nodes, node.id, user_progress)
        tree.append(node_with_progress)
    
    # Сортировка по полю order
    return sorted(tree, key=lambda x: x.order)

@router.get("", response_model=List[schemas.RoadmapNodeWithProgress])
async def get_roadmap(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Получаем все узлы roadmap
    nodes = db.query(models.RoadmapNode).all()
    
    # Получаем прогресс текущего пользователя
    user_progress = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == current_user.id
    ).all()
    
    # Строим дерево, начиная с корневых узлов (parent_id = None)
    roadmap_tree = build_roadmap_tree(nodes, None, user_progress)
    
    return roadmap_tree

@router.post("/progress", response_model=schemas.UserProgressResponse)
async def update_user_progress(
    progress: schemas.UserProgressCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Проверяем существование узла
    node = db.query(models.RoadmapNode).filter(models.RoadmapNode.id == progress.node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Узел не найден")
    
    # Ищем существующий прогресс
    existing_progress = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == current_user.id,
        models.UserProgress.node_id == progress.node_id
    ).first()
    
    if existing_progress:
        # Обновляем существующий прогресс
        existing_progress.is_completed = progress.is_completed
        db.commit()
        db.refresh(existing_progress)
        result = existing_progress
    else:
        # Создаем новый прогресс
        new_progress = models.UserProgress(
            user_id=current_user.id,
            node_id=progress.node_id,
            is_completed=progress.is_completed
        )
        db.add(new_progress)
        db.commit()
        db.refresh(new_progress)
        result = new_progress
    
    # Создаем запись об активности пользователя
    activity_title = f"{'Завершил' if progress.is_completed else 'Сбросил'} шаг: {node.title}"
    activity = models.UserActivity(
        user_id=current_user.id,
        title=activity_title,
        type="roadmap",
        reference_id=node.id
    )
    db.add(activity)
    db.commit()
    
    return result

@router.post("/seed", status_code=status.HTTP_201_CREATED)
async def seed_roadmap_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Проверяем, есть ли уже данные в таблице roadmap_nodes
    existing_nodes = db.query(models.RoadmapNode).count()
    if existing_nodes > 0:
        return {"message": "Данные уже существуют", "count": existing_nodes}
    
    # Загружаем данные из JSON файла
    roadmap_file = os.path.join(os.path.dirname(__file__), '../../data/roadmap.json')
    if not os.path.exists(roadmap_file):
        raise HTTPException(status_code=404, detail="Файл с данными roadmap не найден")
    
    with open(roadmap_file, 'r', encoding='utf-8') as f:
        roadmap_data = json.load(f)
    
    # Функция для рекурсивного добавления узлов
    def add_nodes(nodes, parent_id=None, order_start=0):
        for i, node_data in enumerate(nodes):
            # Создаем узел
            node = models.RoadmapNode(
                title=node_data['title'],
                description=node_data.get('description', None),
                parent_id=parent_id,
                order=order_start + i,
                meta_data=json.dumps(node_data.get('meta_data', {}))
            )
            db.add(node)
            db.flush()  # Получаем ID узла
            
            # Рекурсивно добавляем дочерние узлы
            if 'children' in node_data and node_data['children']:
                add_nodes(node_data['children'], node.id)
    
    # Добавляем узлы
    add_nodes(roadmap_data)
    db.commit()
    
    # Подсчитываем количество добавленных узлов
    node_count = db.query(models.RoadmapNode).count()
    
    return {"message": "Данные успешно добавлены", "count": node_count}
