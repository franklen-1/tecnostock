"""Punto de entrada de FastAPI. Ejecutar:  uvicorn app.main:app --reload"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import auth, categorias, dashboard, movimientos, productos
from app.core.config import settings
from app.core.exceptions import AppError

app = FastAPI(title="TecnoStock API", version="1.0.0")

# CORS: permite que el frontend (Angular, puerto 4200) consuma esta API (puerto 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Manejo centralizado de errores: cualquier AppError se convierte en respuesta HTTP
@app.exception_handler(AppError)
async def manejar_error_app(_: Request, error: AppError):
    return JSONResponse(status_code=error.status_code, content={"detail": error.mensaje})


for modulo in (auth, categorias, productos, movimientos, dashboard):
    app.include_router(modulo.router, prefix="/api")


@app.get("/", tags=["Salud"])
def raiz():
    return {"mensaje": "TecnoStock API funcionando"}
