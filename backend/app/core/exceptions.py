"""Excepciones propias de la aplicación + traducción de errores de SQL Server.

Los procedimientos almacenados lanzan errores con THROW 5000x.
Aquí se convierten en excepciones de Python, y main.py las convierte en respuestas HTTP.
"""
import re


class AppError(Exception):
    """Error base de la aplicación. Cada subclase define su código HTTP."""
    status_code = 500

    def __init__(self, mensaje: str):
        self.mensaje = mensaje
        super().__init__(mensaje)


class NotFoundError(AppError):        # 404
    status_code = 404


class ConflictError(AppError):        # 409 (por ejemplo, código duplicado)
    status_code = 409


class BusinessRuleError(AppError):    # 422 (regla de negocio incumplida)
    status_code = 422


class UnauthorizedError(AppError):    # 401
    status_code = 401


class DatabaseError(AppError):        # 500 (error inesperado de BD)
    status_code = 500


# Código de THROW en SQL Server -> excepción de Python
_CODIGOS = {
    "50001": ConflictError,
    "50002": NotFoundError,
    "50003": BusinessRuleError,
    "50004": BusinessRuleError,
}


def traducir_error(error: Exception) -> AppError:
    """pyodbc devuelve el texto: [SQL Server]Mensaje (50003) ... Extraemos mensaje y código."""
    coincidencia = re.search(r"\[SQL Server\](.*?) \((5000\d)\)", str(error), re.DOTALL)
    if coincidencia:
        mensaje, codigo = coincidencia.group(1).strip(), coincidencia.group(2)
        return _CODIGOS[codigo](mensaje)
    # No se expone el detalle interno de la BD al cliente
    return DatabaseError("Error inesperado al acceder a la base de datos.")
