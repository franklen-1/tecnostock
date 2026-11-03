# TecnoStock – Sistema de inventario

Aplicación web para centralizar el inventario de TecnoStock S.A.C.
**Angular 22 (Signal Forms) + FastAPI + SQL Server (sin ORM, solo procedimientos almacenados).**

## Arquitectura

```
Angular (frontend)  ──HTTP/JSON──►  FastAPI (backend)  ──pyodbc──►  SQL Server
  environments/                       .env (credenciales)             Procedimientos almacenados
```

Backend por capas (`backend/app`):

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| APIs | `api/` | Endpoints HTTP. No contienen SQL ni lógica de negocio |
| Services | `services/` | Reglas de negocio y validaciones |
| Repositories | `repositories/` | Única capa que llama a la BD (solo `EXEC sp_...`) |
| Schemas | `schemas/` | Modelos Pydantic: validación de entrada/salida |
| Core | `core/` | Configuración (.env), conexión pyodbc, excepciones |

Flujo de una petición: `api → service → repository → procedimiento almacenado`.

## Requisitos
- Python 3.11+ y **ODBC Driver 18 for SQL Server**
- SQL Server (local o remoto)
- Node.js 22+ y Angular CLI 22 (`npm i -g @angular/cli@22`)

## Instalación y ejecución

### 1. Base de datos
En SQL Server Management Studio ejecuta, en orden: `database/01_schema.sql`, `02_procedimientos.sql`, `03_datos_iniciales.sql`.

### 2. Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows  (Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          # y edita DB_SERVER, DB_USER, DB_PASS, DB_NOMBRE
uvicorn app.main:app --reload
```
API en http://localhost:8000 · documentación Swagger en http://localhost:8000/docs

### 3. Frontend
La carpeta `frontend/src` contiene el código fuente. Si aún no tienes el proyecto Angular:
```bash
ng new frontend-app --style=css --routing --ssr=false
```
Luego copia el contenido de `frontend/src/` dentro de `frontend-app/src/` (reemplazando archivos), elimina `src/app/app.spec.ts` y ejecuta:
```bash
cd frontend-app
ng serve
```
Abre http://localhost:4200 — usuario de prueba: **admin / admin123**.

## Reglas de negocio implementadas
1. Código de producto único (UNIQUE + validación en SP). 2. Precios > 0 (CHECK, Pydantic y formulario).
3. Cantidades enteras > 0. 4. Sin stock negativo (validado en `sp_Movimiento_RegistrarSalida` + CHECK).
5. Cada entrada/salida genera un registro en `Movimientos`. 6. Stock + historial en una misma transacción.
7. Los productos no se eliminan: se desactivan. 8. Validación en frontend (Signal Forms), backend (Pydantic) y BD (CHECK).

## Seguridad
Las credenciales viven en `backend/.env`, que está en `.gitignore`. Solo se versiona `.env.example`.
