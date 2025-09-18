from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List
import os
import json

from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user

router = APIRouter()

@router.get("", response_model=List[schemas.ConfigTemplateResponse])
async def list_configs(
    category: str = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.ConfigTemplate)
    if category:
        query = query.filter(models.ConfigTemplate.category == category)
    
    configs = query.all()
    
    # Преобразуем объекты конфигурации в словари и добавляем file_path
    result = []
    for config in configs:
        config_dict = {
            "id": config.id,
            "name": config.name,
            "description": config.description,
            "file_path": config.file_path,
            "file_type": config.file_type,
            "category": config.category
        }
        result.append(config_dict)
    
    return result

@router.get("/{config_id}", response_model=schemas.ConfigTemplateResponse)
async def get_config(
    config_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    config = db.query(models.ConfigTemplate).filter(models.ConfigTemplate.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Конфигурация не найдена")
    
    # Регистрируем активность пользователя
    activity = models.UserActivity(
        user_id=current_user.id,
        title=f"Просмотрел конфигурацию: {config.name}",
        type="config",
        reference_id=config.id
    )
    db.add(activity)
    db.commit()
    
    # Преобразуем объект конфигурации в словарь и добавляем file_path
    result = {
        "id": config.id,
        "name": config.name,
        "description": config.description,
        "file_path": config.file_path,
        "file_type": config.file_type,
        "category": config.category
    }
    
    return result

@router.get("/{config_id}/content")
async def get_config_content(
    config_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    config = db.query(models.ConfigTemplate).filter(models.ConfigTemplate.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Конфигурация не найдена")
    
    # Путь к файлу конфигурации
    file_path = os.path.join(os.path.dirname(__file__), "../../data/configs", config.file_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Файл конфигурации не найден")
    
    # Чтение содержимого файла
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Определение типа контента на основе расширения файла
    content_type = "text/plain"
    if config.file_type in ["ini", "json", "conf", "rules"]:
        content_type = "text/plain"
    elif config.file_type == "yml" or config.file_type == "yaml":
        content_type = "application/x-yaml"

    
    return Response(content=content, media_type=content_type)

@router.post("/seed", status_code=status.HTTP_201_CREATED)
async def seed_configs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Проверяем, есть ли уже данные в таблице config_templates
    existing_configs = db.query(models.ConfigTemplate).count()
    if existing_configs > 0:
        return {"message": "Данные уже существуют", "count": existing_configs}
    
    # Список шаблонов для добавления (дополненный на основе скриншота)
    configs = [
        {
            "name": "Docker Compose (базовый)",
            "description": "Базовый шаблон docker-compose.yml для разработки",
            "file_path": "docker-compose.yml",
            "file_type": "yml",
            "category": "docker"
        },
        {
            "name": "Prometheus (базовый)",
            "description": "Базовая конфигурация Prometheus для мониторинга",
            "file_path": "prometheus.yml",
            "file_type": "yml",
            "category": "monitoring"
        },
        {
            "name": "Grafana (базовый)",
            "description": "Базовая конфигурация Grafana для визуализации метрик",
            "file_path": "grafana.ini",
            "file_type": "ini",
            "category": "monitoring"
        },
        {
            "name": "Alert Rules",
            "description": "Правила оповещений для Prometheus",
            "file_path": "alert.rules",
            "file_type": "rules",
            "category": "monitoring"
        },
        {
            "name": "Alert Manager",
            "description": "Конфигурация Alert Manager для обработки оповещений",
            "file_path": "alertmanager.yml",
            "file_type": "yml",
            "category": "monitoring"
        },
        {
            "name": "Loki Config",
            "description": "Конфигурация Loki для сбора и анализа логов",
            "file_path": "loki-config.yml",
            "file_type": "yml",
            "category": "logging"
        },
        {
            "name": "NGINX",
            "description": "Базовая конфигурация NGINX веб-сервера",
            "file_path": "nginx.conf",
            "file_type": "conf",
            "category": "web-server"
        },
        {
            "name": "Promtail",
            "description": "Конфигурация Promtail для сбора логов",
            "file_path": "promtail-config.yml",
            "file_type": "yml",
            "category": "logging"
        },
        {
            "name": "Telegraf",
            "description": "Конфигурация Telegraf для сбора метрик",
            "file_path": "telegraf.conf",
            "file_type": "conf",
            "category": "monitoring"
        },
        {
            "name": "Веб-сервер",
            "description": "Конфигурация веб-сервера",
            "file_path": "www.conf",
            "file_type": "conf",
            "category": "web-server"
        }
    ]
    
    # Добавляем конфигурации в БД
    for config_data in configs:
        config = models.ConfigTemplate(**config_data)
        db.add(config)
    
    db.commit()
    
    # Подсчитываем количество добавленных конфигураций
    config_count = db.query(models.ConfigTemplate).count()
    
    return {"message": "Данные успешно добавлены", "count": config_count}

@router.post("", response_model=schemas.ConfigTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_config_template(
    config: schemas.ConfigTemplateCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создание нового шаблона конфигурации"""
    # Проверяем права администратора
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для создания шаблонов"
        )
    
    new_config = models.ConfigTemplate(
        name=config.name,
        description=config.description,
        file_path=config.file_path,
        file_type=config.file_type,
        category=config.category
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    
    return new_config

@router.put("/{config_id}", response_model=schemas.ConfigTemplateResponse)
async def update_config_template(
    config_id: int,
    config_update: schemas.ConfigTemplateUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновление шаблона конфигурации"""
    # Проверяем права администратора
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для обновления шаблонов"
        )
    
    config = db.query(models.ConfigTemplate).filter(models.ConfigTemplate.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Конфигурация не найдена")
    
    # Обновляем поля
    for field, value in config_update.dict(exclude_unset=True).items():
        setattr(config, field, value)
    
    db.commit()
    db.refresh(config)
    
    return config

@router.delete("/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_config_template(
    config_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удаление шаблона конфигурации"""
    # Проверяем права администратора
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для удаления шаблонов"
        )
    
    config = db.query(models.ConfigTemplate).filter(models.ConfigTemplate.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Конфигурация не найдена")
    
    db.delete(config)
    db.commit()
    
    return None

@router.get("/category", response_model=List[str])
async def get_categories(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение списка всех категорий конфигураций"""
    categories = db.query(models.ConfigTemplate.category).distinct().all()
    return [cat[0] for cat in categories]