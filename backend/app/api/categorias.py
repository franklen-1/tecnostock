from fastapi import APIRouter, status

from app.schemas.categoria import CategoriaCreate, CategoriaOut
from app.services import categoria_service

router = APIRouter(prefix="/categorias", tags=["Categorías"])


@router.get("", response_model=list[CategoriaOut])
def listar():
    return categoria_service.listar()


@router.post("", response_model=CategoriaOut, status_code=status.HTTP_201_CREATED)
def crear(datos: CategoriaCreate):
    return categoria_service.crear(datos)
