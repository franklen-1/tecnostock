from app.core.database import ejecutar_sp


def indicadores() -> dict:
    return ejecutar_sp("sp_Dashboard_Indicadores", modo="one")
