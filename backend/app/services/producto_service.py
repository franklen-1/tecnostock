from app.core.exceptions import BusinessRuleError, NotFoundError
from app.repositories import producto_repository
from app.schemas.producto import ProductoCreate, ProductoUpdate


def _limpiar(datos: ProductoCreate | ProductoUpdate) -> dict:
    """Normaliza el código (mayúsculas, sin espacios) y valida reglas entre campos."""
    d = datos.model_dump()
    d["codigo"] = d["codigo"].strip().upper()
    d["nombre"] = d["nombre"].strip()
    if d["precio_venta"] < d["precio_compra"]:
        raise BusinessRuleError("El precio de venta no puede ser menor al precio de compra.")
    return d


def crear(datos: ProductoCreate) -> dict:
    id_nuevo = producto_repository.crear(_limpiar(datos))
    return obtener(id_nuevo)


def listar(busqueda: str | None, id_categoria: int | None, solo_activos: bool) -> list[dict]:
    texto = busqueda.strip() if busqueda else None
    return producto_repository.listar(texto or None, id_categoria, solo_activos)


def obtener(id_producto: int) -> dict:
    producto = producto_repository.obtener_por_id(id_producto)
    if producto is None:
        raise NotFoundError("El producto no existe.")
    return producto


def actualizar(id_producto: int, datos: ProductoUpdate) -> dict:
    producto_repository.actualizar(id_producto, _limpiar(datos))
    return obtener(id_producto)


def cambiar_estado(id_producto: int, activo: bool) -> dict:
    producto_repository.cambiar_estado(id_producto, activo)
    return obtener(id_producto)


def stock_bajo() -> list[dict]:
    return producto_repository.stock_bajo()
