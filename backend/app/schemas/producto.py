from pydantic import BaseModel, Field


class ProductoBase(BaseModel):
    codigo: str = Field(min_length=2, max_length=30)
    nombre: str = Field(min_length=2, max_length=120)
    descripcion: str | None = Field(default=None, max_length=300)
    id_categoria: int = Field(gt=0)
    precio_compra: float = Field(gt=0)      # RN2: precios mayores que cero
    precio_venta: float = Field(gt=0)
    stock_minimo: int = Field(ge=0)


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(ProductoBase):
    pass


class ProductoEstado(BaseModel):
    activo: bool


class ProductoOut(ProductoBase):
    id_producto: int
    categoria: str
    stock_actual: int
    activo: bool
