"""Schemas = forma y validación de los datos que entran y salen por la API."""
from pydantic import BaseModel, Field


class LoginIn(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=100)


class UsuarioOut(BaseModel):
    id_usuario: int
    username: str
    nombre_completo: str
