"""API = capa HTTP: recibe la petición, llama al Service y devuelve la respuesta."""
from fastapi import APIRouter

from app.schemas.usuario import LoginIn, UsuarioOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=UsuarioOut)
def login(datos: LoginIn):
    return auth_service.iniciar_sesion(datos)
