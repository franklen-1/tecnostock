from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class MovimientoCreate(BaseModel):
    id_producto: int = Field(gt=0)
    cantidad: int = Field(gt=0)             # RN3: entero mayor que cero
    fecha: datetime | None = None           # si no se envía, se usa la fecha actual
    motivo: str = Field(min_length=3, max_length=200)


class MovimientoResultado(BaseModel):
    id_movimiento: int
    stock_anterior: int
    stock_posterior: int


class MovimientoOut(BaseModel):
    id_movimiento: int
    id_producto: int
    codigo: str
    producto: str
    tipo: Literal["E", "S"]
    cantidad: int
    fecha: datetime
    motivo: str
    stock_anterior: int
    stock_posterior: int
