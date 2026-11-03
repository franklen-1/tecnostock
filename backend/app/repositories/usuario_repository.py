"""Repositories = única capa que habla con la BD (solo llama procedimientos almacenados)."""
from app.core.database import ejecutar_sp


def login(username: str, password: str) -> dict | None:
    return ejecutar_sp("sp_Usuario_Login", {"Username": username, "Password": password}, modo="one")
