"""Services = lógica de negocio y reglas. No conocen SQL ni HTTP."""
from app.core.exceptions import UnauthorizedError
from app.repositories import usuario_repository
from app.schemas.usuario import LoginIn


def iniciar_sesion(datos: LoginIn) -> dict:
    usuario = usuario_repository.login(datos.username, datos.password)
    if usuario is None:
        raise UnauthorizedError("Usuario o contraseña incorrectos.")
    return usuario
