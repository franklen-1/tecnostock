from app.core.database import ejecutar_sp


def crear(nombre: str, descripcion: str | None) -> dict:
    return ejecutar_sp("sp_Categoria_Crear", {"Nombre": nombre, "Descripcion": descripcion}, modo="one")


def listar() -> list[dict]:
    return ejecutar_sp("sp_Categoria_Listar")
