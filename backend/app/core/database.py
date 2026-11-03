"""Acceso a SQL Server SIN ORM: solo pyodbc + procedimientos almacenados."""
import pyodbc

from app.core.config import settings
from app.core.exceptions import traducir_error


def obtener_conexion() -> pyodbc.Connection:
    cadena = (
        f"DRIVER={{{settings.db_driver}}};"
        f"SERVER={settings.db_server};DATABASE={settings.db_nombre};"
        f"UID={settings.db_user};PWD={settings.db_pass};"
        "TrustServerCertificate=yes"
    )
    return pyodbc.connect(cadena)


def ejecutar_sp(nombre: str, parametros: dict | None = None, modo: str = "all"):
    """Ejecuta un procedimiento almacenado.

    nombre:     nombre del SP, ej. "sp_Producto_Listar"
    parametros: diccionario {"IdProducto": 1}  ->  EXEC sp @IdProducto=?
    modo:       "all"  = devuelve lista de diccionarios
                "one"  = devuelve un diccionario (o None si no hay filas)
                "none" = no devuelve datos (INSERT/UPDATE sin resultado)
    """
    parametros = parametros or {}
    asignaciones = ", ".join(f"@{clave}=?" for clave in parametros)
    sql = f"EXEC {nombre} {asignaciones}".strip()

    conexion = obtener_conexion()
    try:
        cursor = conexion.cursor()
        cursor.execute(sql, list(parametros.values()))   # parámetros enlazados: evita inyección SQL

        resultado = None
        if modo != "none":
            columnas = [c[0] for c in cursor.description]
            filas = [dict(zip(columnas, fila)) for fila in cursor.fetchall()]
            resultado = filas if modo == "all" else (filas[0] if filas else None)

        conexion.commit()
        return resultado
    except pyodbc.Error as error:
        conexion.rollback()
        raise traducir_error(error)
    finally:
        conexion.close()
