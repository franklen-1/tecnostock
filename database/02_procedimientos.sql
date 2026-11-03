-- =====================================================================
-- Procedimientos almacenados.
-- Códigos de error propios (THROW) que el backend traduce a HTTP:
--   50001 = duplicado (409)   50002 = no existe (404)
--   50003 = stock insuficiente (422)   50004 = regla de negocio / dato inválido (422)
-- Los alias de columnas están en snake_case para coincidir con los Schemas de Python.
-- =====================================================================
USE TecnoStockDB;
GO

-- ------------------------------ USUARIOS ------------------------------
CREATE OR ALTER PROCEDURE sp_Usuario_Login @Username NVARCHAR(50), @Password NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdUsuario AS id_usuario, Username AS username, NombreCompleto AS nombre_completo
    FROM Usuarios
    WHERE Username = @Username
      AND PasswordHash = HASHBYTES('SHA2_256', @Password)
      AND Activo = 1;
END
GO

-- ----------------------------- CATEGORIAS -----------------------------
CREATE OR ALTER PROCEDURE sp_Categoria_Crear @Nombre NVARCHAR(80), @Descripcion NVARCHAR(250)
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Categorias WHERE Nombre = @Nombre)
        THROW 50001, 'Ya existe una categoría con ese nombre.', 1;

    INSERT INTO Categorias (Nombre, Descripcion) VALUES (@Nombre, @Descripcion);

    SELECT IdCategoria AS id_categoria, Nombre AS nombre, Descripcion AS descripcion
    FROM Categorias WHERE IdCategoria = SCOPE_IDENTITY();
END
GO

CREATE OR ALTER PROCEDURE sp_Categoria_Listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdCategoria AS id_categoria, Nombre AS nombre, Descripcion AS descripcion
    FROM Categorias ORDER BY Nombre;
END
GO

-- ------------------------------ PRODUCTOS -----------------------------
CREATE OR ALTER PROCEDURE sp_Producto_Crear
    @Codigo NVARCHAR(30), @Nombre NVARCHAR(120), @Descripcion NVARCHAR(300),
    @IdCategoria INT, @PrecioCompra DECIMAL(10,2), @PrecioVenta DECIMAL(10,2), @StockMinimo INT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Productos WHERE Codigo = @Codigo)
        THROW 50001, 'Ya existe un producto con ese código.', 1;
    IF NOT EXISTS (SELECT 1 FROM Categorias WHERE IdCategoria = @IdCategoria)
        THROW 50004, 'La categoría indicada no existe.', 1;

    -- El stock inicia en 0: el stock solo cambia mediante entradas y salidas
    INSERT INTO Productos (Codigo, Nombre, Descripcion, IdCategoria, PrecioCompra, PrecioVenta, StockActual, StockMinimo)
    VALUES (@Codigo, @Nombre, @Descripcion, @IdCategoria, @PrecioCompra, @PrecioVenta, 0, @StockMinimo);

    SELECT SCOPE_IDENTITY() AS id_producto;
END
GO

CREATE OR ALTER PROCEDURE sp_Producto_Listar
    @Busqueda NVARCHAR(120) = NULL, @IdCategoria INT = NULL, @SoloActivos BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.IdProducto AS id_producto, p.Codigo AS codigo, p.Nombre AS nombre, p.Descripcion AS descripcion,
           p.IdCategoria AS id_categoria, c.Nombre AS categoria,
           p.PrecioCompra AS precio_compra, p.PrecioVenta AS precio_venta,
           p.StockActual AS stock_actual, p.StockMinimo AS stock_minimo, p.Activo AS activo
    FROM Productos p
    INNER JOIN Categorias c ON c.IdCategoria = p.IdCategoria
    WHERE (@Busqueda IS NULL OR p.Codigo LIKE '%' + @Busqueda + '%' OR p.Nombre LIKE '%' + @Busqueda + '%')
      AND (@IdCategoria IS NULL OR p.IdCategoria = @IdCategoria)
      AND (@SoloActivos = 0 OR p.Activo = 1)
    ORDER BY p.Nombre;
END
GO

CREATE OR ALTER PROCEDURE sp_Producto_ObtenerPorId @IdProducto INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.IdProducto AS id_producto, p.Codigo AS codigo, p.Nombre AS nombre, p.Descripcion AS descripcion,
           p.IdCategoria AS id_categoria, c.Nombre AS categoria,
           p.PrecioCompra AS precio_compra, p.PrecioVenta AS precio_venta,
           p.StockActual AS stock_actual, p.StockMinimo AS stock_minimo, p.Activo AS activo
    FROM Productos p
    INNER JOIN Categorias c ON c.IdCategoria = p.IdCategoria
    WHERE p.IdProducto = @IdProducto;
END
GO

-- No actualiza el stock (eso solo lo hacen los movimientos)
CREATE OR ALTER PROCEDURE sp_Producto_Actualizar
    @IdProducto INT, @Codigo NVARCHAR(30), @Nombre NVARCHAR(120), @Descripcion NVARCHAR(300),
    @IdCategoria INT, @PrecioCompra DECIMAL(10,2), @PrecioVenta DECIMAL(10,2), @StockMinimo INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Productos WHERE IdProducto = @IdProducto)
        THROW 50002, 'El producto no existe.', 1;
    IF EXISTS (SELECT 1 FROM Productos WHERE Codigo = @Codigo AND IdProducto <> @IdProducto)
        THROW 50001, 'Ya existe otro producto con ese código.', 1;
    IF NOT EXISTS (SELECT 1 FROM Categorias WHERE IdCategoria = @IdCategoria)
        THROW 50004, 'La categoría indicada no existe.', 1;

    UPDATE Productos
    SET Codigo = @Codigo, Nombre = @Nombre, Descripcion = @Descripcion, IdCategoria = @IdCategoria,
        PrecioCompra = @PrecioCompra, PrecioVenta = @PrecioVenta, StockMinimo = @StockMinimo
    WHERE IdProducto = @IdProducto;
END
GO

-- Desactivar / reactivar (RN7: nunca se borra físicamente, se conserva el historial)
CREATE OR ALTER PROCEDURE sp_Producto_CambiarEstado @IdProducto INT, @Activo BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Productos WHERE IdProducto = @IdProducto)
        THROW 50002, 'El producto no existe.', 1;
    UPDATE Productos SET Activo = @Activo WHERE IdProducto = @IdProducto;
END
GO

CREATE OR ALTER PROCEDURE sp_Producto_StockBajo
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.IdProducto AS id_producto, p.Codigo AS codigo, p.Nombre AS nombre, p.Descripcion AS descripcion,
           p.IdCategoria AS id_categoria, c.Nombre AS categoria,
           p.PrecioCompra AS precio_compra, p.PrecioVenta AS precio_venta,
           p.StockActual AS stock_actual, p.StockMinimo AS stock_minimo, p.Activo AS activo
    FROM Productos p
    INNER JOIN Categorias c ON c.IdCategoria = p.IdCategoria
    WHERE p.Activo = 1 AND p.StockActual <= p.StockMinimo      -- "igual o inferior" al mínimo
    ORDER BY p.StockActual;
END
GO

-- ----------------------------- MOVIMIENTOS ----------------------------
-- RN5 y RN6: actualizar stock + registrar historial en UNA transacción.
-- UPDLOCK bloquea la fila del producto para evitar que dos operaciones
-- simultáneas lean el mismo stock (evita condiciones de carrera).
CREATE OR ALTER PROCEDURE sp_Movimiento_RegistrarEntrada
    @IdProducto INT, @Cantidad INT, @Fecha DATETIME2, @Motivo NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @Cantidad IS NULL OR @Cantidad <= 0
        THROW 50004, 'La cantidad debe ser un entero mayor que cero.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @StockAnterior INT, @Activo BIT;
        SELECT @StockAnterior = StockActual, @Activo = Activo
        FROM Productos WITH (UPDLOCK, ROWLOCK) WHERE IdProducto = @IdProducto;

        IF @StockAnterior IS NULL THROW 50002, 'El producto no existe.', 1;
        IF @Activo = 0 THROW 50004, 'El producto está desactivado.', 1;

        DECLARE @StockPosterior INT = @StockAnterior + @Cantidad;

        UPDATE Productos SET StockActual = @StockPosterior WHERE IdProducto = @IdProducto;

        INSERT INTO Movimientos (IdProducto, Tipo, Cantidad, Fecha, Motivo, StockAnterior, StockPosterior)
        VALUES (@IdProducto, 'E', @Cantidad, @Fecha, @Motivo, @StockAnterior, @StockPosterior);

        DECLARE @IdMovimiento INT = SCOPE_IDENTITY();
        COMMIT TRANSACTION;

        SELECT @IdMovimiento AS id_movimiento, @StockAnterior AS stock_anterior, @StockPosterior AS stock_posterior;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_Movimiento_RegistrarSalida
    @IdProducto INT, @Cantidad INT, @Fecha DATETIME2, @Motivo NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @Cantidad IS NULL OR @Cantidad <= 0
        THROW 50004, 'La cantidad debe ser un entero mayor que cero.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @StockAnterior INT, @Activo BIT;
        SELECT @StockAnterior = StockActual, @Activo = Activo
        FROM Productos WITH (UPDLOCK, ROWLOCK) WHERE IdProducto = @IdProducto;

        IF @StockAnterior IS NULL THROW 50002, 'El producto no existe.', 1;
        IF @Activo = 0 THROW 50004, 'El producto está desactivado.', 1;
        -- RN4: no se permite stock negativo
        IF @Cantidad > @StockAnterior THROW 50003, 'Stock insuficiente: la salida supera el stock disponible.', 1;

        DECLARE @StockPosterior INT = @StockAnterior - @Cantidad;

        UPDATE Productos SET StockActual = @StockPosterior WHERE IdProducto = @IdProducto;

        INSERT INTO Movimientos (IdProducto, Tipo, Cantidad, Fecha, Motivo, StockAnterior, StockPosterior)
        VALUES (@IdProducto, 'S', @Cantidad, @Fecha, @Motivo, @StockAnterior, @StockPosterior);

        DECLARE @IdMovimiento INT = SCOPE_IDENTITY();
        COMMIT TRANSACTION;

        SELECT @IdMovimiento AS id_movimiento, @StockAnterior AS stock_anterior, @StockPosterior AS stock_posterior;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Historial con filtros opcionales por producto y rango de fechas (RF05 y RF06)
CREATE OR ALTER PROCEDURE sp_Movimiento_Listar
    @IdProducto INT = NULL, @FechaDesde DATE = NULL, @FechaHasta DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT m.IdMovimiento AS id_movimiento, m.IdProducto AS id_producto,
           p.Codigo AS codigo, p.Nombre AS producto,
           m.Tipo AS tipo, m.Cantidad AS cantidad, m.Fecha AS fecha, m.Motivo AS motivo,
           m.StockAnterior AS stock_anterior, m.StockPosterior AS stock_posterior
    FROM Movimientos m
    INNER JOIN Productos p ON p.IdProducto = m.IdProducto
    WHERE (@IdProducto IS NULL OR m.IdProducto = @IdProducto)
      AND (@FechaDesde IS NULL OR m.Fecha >= @FechaDesde)
      AND (@FechaHasta IS NULL OR m.Fecha <  DATEADD(DAY, 1, @FechaHasta))  -- incluye todo el día "hasta"
    ORDER BY m.Fecha DESC, m.IdMovimiento DESC;
END
GO

-- ------------------------------ INDICADORES ---------------------------
CREATE OR ALTER PROCEDURE sp_Dashboard_Indicadores
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        (SELECT COUNT(*) FROM Productos WHERE Activo = 1)                                   AS productos_activos,
        (SELECT COUNT(*) FROM Productos WHERE Activo = 1 AND StockActual <= StockMinimo)    AS productos_stock_bajo,
        (SELECT ISNULL(SUM(StockActual * PrecioCompra), 0) FROM Productos WHERE Activo = 1) AS valor_inventario;
END
GO
