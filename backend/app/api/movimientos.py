from datetime import date

from fastapi import APIRouter, Query, status

from app.schemas.movimiento import MovimientoCreate, MovimientoOut, MovimientoResultado
from app.services import movimiento_service

router = APIRouter(prefix="/movimientos", tags=["Movimientos"])


@router.get("", response_model=list[MovimientoOut])
def listar(id_producto: int | None = Query(None), fecha_desde: date | None = Query(None),
           fecha_hasta: date | None = Query(None)):
    return movimiento_service.listar(id_producto, fecha_desde, fecha_hasta)


@router.post("/entradas", response_model=MovimientoResultado, status_code=status.HTTP_201_CREATED)
def registrar_entrada(datos: MovimientoCreate):
    return movimiento_service.registrar_entrada(datos)


@router.post("/salidas", response_model=MovimientoResultado, status_code=status.HTTP_201_CREATED)
def registrar_salida(datos: MovimientoCreate):
    return movimiento_service.registrar_salida(datos)
