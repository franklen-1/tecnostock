from app.repositories import categoria_repository
from app.schemas.categoria import CategoriaCreate


def crear(datos: CategoriaCreate) -> dict:
    return categoria_repository.crear(datos.nombre.strip(), datos.descripcion)


def listar() -> list[dict]:
    return categoria_repository.listar()
