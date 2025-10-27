# backend/main.py (Обновленный - ключевые изменения выделены)

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from urllib.parse import unquote
from typing import Annotated, List 
from pydantic import BaseModel 
import models
import schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ...
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://176.108.255.248:3000",
    "http://localhost",
    "http://defect_frontend:3000", # Добавить имя сервиса фронтенда, если обращение идет внутри Docker сети
]
# ...

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,      
    allow_methods=["*"],         
    allow_headers=["*"],         
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Хелперы (вставлены для полноты, в вашей версии могут быть в utils)
def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Декодируем токен (username) из URL, чтобы обработать кириллицу
    try:
        decoded_username = unquote(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format", headers={"WWW-Authenticate": "Bearer"})
    
    user = get_user(db, username=decoded_username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    return user

# --- НОВАЯ ЗАВИСИМОСТЬ ДЛЯ RBAC ---
def authorize_roles(allowed_roles: List[schemas.UserRole]):
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Недостаточно прав. Требуемая роль: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker


# ----------------- АУТЕНТИФИКАЦИЯ И ПОЛЬЗОВАТЕЛИ -----------------

@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = pwd_context.hash(user.password)
    # Сохраняем переданную роль (по умолчанию "Инженер")
    db_user = models.User(username=user.username, hashed_password=hashed_password, role=user.role) 
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- НОВЫЙ ЭНДПОИНТ ДЛЯ ЛОГИНА (OAuth2) ---
@app.post("/token", tags=["auth"])
def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    user = get_user(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Возвращаем токен (username) и роль
    return {"access_token": user.username, "token_type": "bearer", "role": user.role}


# --- ИСПРАВЛЕННЫЙ ЭНДПОИНТ: Получить список инженеров ---
@app.get("/users/engineers", response_model=List[schemas.User])
def get_engineers(db: Session = Depends(get_db), 
                  current_user: models.User = Depends(get_current_user)):  # УБРАЛ ограничение только для менеджеров
    # Теперь доступно всем авторизованным пользователям
    engineers = db.query(models.User).filter(models.User.role == schemas.UserRole.ENGINEER).all()
    return engineers


# ----------------- CRUD DEFEСTS (С RBAC) -----------------

# Создание дефекта
@app.post("/defects/", response_model=schemas.Defect)
def create_defect(
    defect: schemas.DefectCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Получаем авторизованного пользователя
):
    # Проверяем, имеет ли пользователь право создавать дефекты
    if current_user.role not in [schemas.UserRole.ENGINEER, schemas.UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Только Инженер или Менеджер может создавать дефекты."
        )

    # !!! ИСПРАВЛЕНИЕ: Используем ID текущего пользователя как creator_id
    db_defect = models.Defect(
        **defect.model_dump(), 
        creator_id=current_user.id,
        status=schemas.DefectStatus.NEW # Дефект всегда создается в статусе "Новая"
    )
    
    db.add(db_defect)
    db.commit()
    db.refresh(db_defect)

    # Подгружаем связанные данные для ответа
    db_defect.creator = current_user
    if db_defect.executor_id:
        db_defect.executor = db.query(models.User).filter(models.User.id == db_defect.executor_id).first()
        
    return db_defect

# Чтение дефектов
@app.get("/defects/", response_model=list[schemas.Defect])
def read_defects(skip: int = 0, limit: int = 100, 
                 db: Session = Depends(get_db),
                 current_user: models.User = Depends(get_current_user)):
    # Доступно всем аутентифицированным пользователям
    defects = db.query(models.Defect).offset(skip).limit(limit).all()
    
    # Оптимизация загрузки связанных данных
    user_ids = {d.creator_id for d in defects if d.creator_id} | {d.executor_id for d in defects if d.executor_id}
    users_map = {u.id: u for u in db.query(models.User).filter(models.User.id.in_(user_ids)).all()}
    
    for defect in defects:
        defect.creator = users_map.get(defect.creator_id)
        defect.executor = users_map.get(defect.executor_id)
        
    return defects

# --- НОВЫЙ ЭНДПОИНТ ДЛЯ ОБНОВЛЕНИЯ ДЕФЕКТА (PATCH) ---
@app.patch("/defects/{defect_id}", response_model=schemas.Defect)
def update_defect(defect_id: int, 
                  defect_update: schemas.DefectUpdate, 
                  db: Session = Depends(get_db),
                  current_user: models.User = Depends(get_current_user)):
    
    db_defect = db.query(models.Defect).filter(models.Defect.id == defect_id).first()
    if not db_defect:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Defect not found")

    update_data = defect_update.model_dump(exclude_unset=True)

    if current_user.role == schemas.UserRole.MANAGER:
        # Менеджер: Может менять все
        for key, value in update_data.items():
            setattr(db_defect, key, value)
    
    elif current_user.role == schemas.UserRole.ENGINEER:
        # Инженер: Может менять только СТАТУС, если он исполнитель
        if db_defect.executor_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Инженер может обновлять статус только своего дефекта.")
        
        # Если пытаются изменить что-то, кроме статуса, запрещаем
        if any(key != 'status' for key in update_data.keys()):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Инженер может менять только статус дефекта.")

        if 'status' in update_data:
            setattr(db_defect, 'status', update_data['status'])
            
    elif current_user.role == schemas.UserRole.OBSERVER:
        # Руководитель: Не может менять ничего
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Руководитель не может изменять дефекты.")
    
    # Если данные есть, сохраняем изменения
    if update_data:
        db.add(db_defect)
        db.commit()
        db.refresh(db_defect)
    
    # Подгружаем связанные данные для ответа
    db_defect.creator = db.query(models.User).filter(models.User.id == db_defect.creator_id).first()
    if db_defect.executor_id:
        db_defect.executor = db.query(models.User).filter(models.User.id == db_defect.executor_id).first()
        
    return db_defect

@app.get("/defects/{defect_id}", response_model=schemas.Defect)
def read_defect(defect_id: int, 
                db: Session = Depends(get_db), 
                current_user: models.User = Depends(get_current_user)):
    
    db_defect = db.query(models.Defect).filter(models.Defect.id == defect_id).first()
    
    if not db_defect:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Defect not found")

    # Для корректного возврата Defect (включая Comments), нам нужно подгрузить связи:
    db_defect.creator # Подгружаем создателя
    db_defect.executor # Подгружаем исполнителя
    
    for comment in db_defect.comments:
        comment.author # Подгружаем автора каждого комментария

    return db_defect

# --- НОВЫЙ ЭНДПОИНТ: Добавление комментария ---
@app.post("/defects/{defect_id}/comments/", response_model=schemas.Comment, status_code=status.HTTP_201_CREATED)
def create_comment_for_defect(
    defect_id: int, 
    comment: schemas.CommentCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # 1. Проверяем существование дефекта
    db_defect = db.query(models.Defect).filter(models.Defect.id == defect_id).first()
    if not db_defect:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Defect not found")

    # 2. Создаем новый объект комментария
    db_comment = models.Comment(
        content=comment.content,
        defect_id=defect_id,
        author_id=current_user.id
    )
    
    # 3. Сохраняем в БД
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Подгружаем автора для ответа
    db_comment.author = current_user

    return db_comment

@app.get("/")
async def root():
    return {"message": "Defect Tracking API is running"}