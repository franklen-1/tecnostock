from datetime import date, datetime

from app.core.exceptions import BusinessRuleError
from app.repositories import movimiento_repository
from app.schemas.movimiento import MovimientoCreate


def _fecha(datos: MovimientoCreate) -> datetime:
    return datos.fecha or datetime.now()


def registrar_entrada(datos: MovimientoCreate) -> dict:
    return movimiento_repository.registrar_entrada(
        datos.id_producto, datos.cantidad, _fecha(datos), datos.motivo.strip())


def registrar_salida(datos: MovimientoCreate) -> dict:
    # La validación de stock negativo la garantiza el procedimiento almacenado (con transacción)
    return movimiento_repository.registrar_salida(
        datos.id_producto, datos.cantidad, _fecha(datos), datos.motivo.strip())


def listar(id_producto: int | None, fecha_desde: date | None, fecha_hasta: date | None) -> list[dict]:
    if fecha_desde and fecha_hasta and fecha_desde > fecha_hasta:
        raise BusinessRuleError("La fecha inicial no puede ser mayor que la fecha final.")
    return movimiento_repository.listar(id_producto, fecha_desde, fecha_hasta)
