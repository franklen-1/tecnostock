from pydantic import BaseModel, Field


class CategoriaCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=80)
    descripcion: str | None = Field(default=None, max_length=250)


class CategoriaOut(BaseModel):
    id_categoria: int
    nombre: str
    descripcion: str | None = None
