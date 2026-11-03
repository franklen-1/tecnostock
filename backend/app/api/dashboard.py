from fastapi import APIRouter

from app.schemas.dashboard import DashboardOut
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardOut)
def indicadores():
    return dashboard_service.obtener_indicadores()
