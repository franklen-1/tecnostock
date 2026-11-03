from app.repositories import dashboard_repository


def obtener_indicadores() -> dict:
    return dashboard_repository.indicadores()
