from app.core.database import ejecutar_sp


def crear(d: dict) -> int:
    fila = ejecutar_sp("sp_Producto_Crear", {
        "Codigo": d["codigo"], "Nombre": d["nombre"], "Descripcion": d["descripcion"],
        "IdCategoria": d["id_categoria"], "PrecioCompra": d["precio_compra"],
        "PrecioVenta": d["precio_venta"], "StockMinimo": d["stock_minimo"],
    }, modo="one")
    return int(fila["id_producto"])


def listar(busqueda: str | None, id_categoria: int | None, solo_activos: bool) -> list[dict]:
    return ejecutar_sp("sp_Producto_Listar", {
        "Busqueda": busqueda, "IdCategoria": id_categoria, "SoloActivos": solo_activos,
    })


def obtener_por_id(id_producto: int) -> dict | None:
    return ejecutar_sp("sp_Producto_ObtenerPorId", {"IdProducto": id_producto}, modo="one")


def actualizar(id_producto: int, d: dict) -> None:
    ejecutar_sp("sp_Producto_Actualizar", {
        "IdProducto": id_producto, "Codigo": d["codigo"], "Nombre": d["nombre"],
        "Descripcion": d["descripcion"], "IdCategoria": d["id_categoria"],
        "PrecioCompra": d["precio_compra"], "PrecioVenta": d["precio_venta"],
        "StockMinimo": d["stock_minimo"],
    }, modo="none")


def cambiar_estado(id_producto: int, activo: bool) -> None:
    ejecutar_sp("sp_Producto_CambiarEstado", {"IdProducto": id_producto, "Activo": activo}, modo="none")


def stock_bajo() -> list[dict]:
    return ejecutar_sp("sp_Producto_StockBajo")
