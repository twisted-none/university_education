from fastapi import APIRouter, Body
from typing import Dict, Any, Optional

router = APIRouter()

@router.post("")
async def log_frontend_data(
    message: Optional[str] = Body(None),
    data: Optional[Dict[str, Any]] = Body(None)
):
    """Endpoint для логирования данных с фронтенда"""
    if message:
        print(f"FRONTEND LOG: {message}")
    if data:
        print(f"LOG DATA: {data}")
    return {"status": "logged"}