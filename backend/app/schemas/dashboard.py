from pydantic import BaseModel


class DashboardOut(BaseModel):
    productos_activos: int
    productos_stock_bajo: int
    valor_inventario: float
