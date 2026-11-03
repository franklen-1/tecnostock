from datetime import date, datetime

from app.core.database import ejecutar_sp


def registrar_entrada(id_producto: int, cantidad: int, fecha: datetime, motivo: str) -> dict:
    return ejecutar_sp("sp_Movimiento_RegistrarEntrada", {
        "IdProducto": id_producto, "Cantidad": cantidad, "Fecha": fecha, "Motivo": motivo,
    }, modo="one")


def registrar_salida(id_producto: int, cantidad: int, fecha: datetime, motivo: str) -> dict:
    return ejecutar_sp("sp_Movimiento_RegistrarSalida", {
        "IdProducto": id_producto, "Cantidad": cantidad, "Fecha": fecha, "Motivo": motivo,
    }, modo="one")


def listar(id_producto: int | None, fecha_desde: date | None, fecha_hasta: date | None) -> list[dict]:
    return ejecutar_sp("sp_Movimiento_Listar", {
        "IdProducto": id_producto, "FechaDesde": fecha_desde, "FechaHasta": fecha_hasta,
    })
