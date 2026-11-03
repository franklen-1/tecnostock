from fastapi import APIRouter, Query, status

from app.schemas.producto import ProductoCreate, ProductoEstado, ProductoOut, ProductoUpdate
from app.services import producto_service

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("", response_model=list[ProductoOut])
def listar(busqueda: str | None = Query(None), id_categoria: int | None = Query(None),
           solo_activos: bool = Query(False)):
    return producto_service.listar(busqueda, id_categoria, solo_activos)


# Esta ruta va ANTES de "/{id_producto}" para que "stock-bajo" no se confunda con un id
@router.get("/stock-bajo", response_model=list[ProductoOut])
def stock_bajo():
    return producto_service.stock_bajo()


@router.get("/{id_producto}", response_model=ProductoOut)
def obtener(id_producto: int):
    return producto_service.obtener(id_producto)


@router.post("", response_model=ProductoOut, status_code=status.HTTP_201_CREATED)
def crear(datos: ProductoCreate):
    return producto_service.crear(datos)


@router.put("/{id_producto}", response_model=ProductoOut)
def actualizar(id_producto: int, datos: ProductoUpdate):
    return producto_service.actualizar(id_producto, datos)


@router.patch("/{id_producto}/estado", response_model=ProductoOut)
def cambiar_estado(id_producto: int, datos: ProductoEstado):
    return producto_service.cambiar_estado(id_producto, datos.activo)
