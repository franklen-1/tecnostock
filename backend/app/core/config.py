"""Configuración: lee las credenciales desde el archivo .env (nunca van en el código)."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    db_server: str = "."
    db_user: str = "sa"
    db_pass: str
    db_nombre: str = "TecnoStockDB"
    db_driver: str = "ODBC Driver 18 for SQL Server"
    cors_origins: str = "http://localhost:4200"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
