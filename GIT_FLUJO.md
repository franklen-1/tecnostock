# Flujo de Git, ramas y Pull Requests (guía para el examen)

Crea un repositorio en GitHub (vacío) y sigue estos pasos. Cada bloque = una rama = un Pull Request.

```bash
git init
git add .gitignore README.md
git commit -m "chore: estructura inicial y README"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/tecnostock.git
git push -u origin main
```

## Ramas sugeridas (una por funcionalidad)
| Rama | Contenido | Commits de ejemplo |
|---|---|---|
| `feature/base-datos` | `database/01..03` | `feat(db): tablas y restricciones` / `feat(db): procedimientos de productos` / `feat(db): entradas y salidas con transacción` |
| `feature/backend-core` | `backend/app/core`, `main.py` | `feat(api): conexión pyodbc sin ORM` / `feat(api): manejo de errores y CORS` |
| `feature/backend-categorias-productos` | schemas, repos, services, api | `feat(api): CRUD de categorías` / `feat(api): productos con filtros` |
| `feature/backend-movimientos` | movimientos y dashboard | `feat(api): entradas y salidas` / `feat(api): indicadores` |
| `feature/frontend-base-login` | rutas, guard, login, layout | `feat(web): login con Signal Forms` |
| `feature/frontend-productos-categorias` | pantallas | `feat(web): gestión de productos` |
| `feature/frontend-movimientos` | entradas/salidas, historial, stock bajo | `feat(web): registro de salidas` |

## Ciclo de cada rama
```bash
git checkout main && git pull
git checkout -b feature/base-datos
# ... trabajar y hacer varios commits pequeños ...
git add database/
git commit -m "feat(db): tablas y restricciones"
git push -u origin feature/base-datos
# En GitHub: "Compare & pull request" -> describir cambios -> "Merge pull request"
git checkout main && git pull
```
> Haz **commits frecuentes** (uno por cambio lógico) y **no** hagas todo en un solo commit: la rúbrica evalúa el historial.
