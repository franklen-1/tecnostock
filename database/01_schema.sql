-- =====================================================================
-- TecnoStock S.A.C. - Esquema de base de datos (SQL Server)
-- Ejecutar primero este script, luego 02_procedimientos.sql y 03_datos_iniciales.sql
-- =====================================================================
IF DB_ID('TecnoStockDB') IS NULL CREATE DATABASE TecnoStockDB;
GO
USE TecnoStockDB;
GO

-- Se borran en orden inverso a las dependencias (para poder re-ejecutar el script)
IF OBJECT_ID('Movimientos') IS NOT NULL DROP TABLE Movimientos;
IF OBJECT_ID('Productos')   IS NOT NULL DROP TABLE Productos;
IF OBJECT_ID('Categorias')  IS NOT NULL DROP TABLE Categorias;
IF OBJECT_ID('Usuarios')    IS NOT NULL DROP TABLE Usuarios;
GO

CREATE TABLE Usuarios (
    IdUsuario      INT IDENTITY(1,1) CONSTRAINT PK_Usuarios PRIMARY KEY,
    Username       NVARCHAR(50)  NOT NULL CONSTRAINT UQ_Usuarios_Username UNIQUE,
    PasswordHash   VARBINARY(32) NOT NULL,          -- SHA2_256 de la contraseña
    NombreCompleto NVARCHAR(120) NOT NULL,
    Activo         BIT NOT NULL CONSTRAINT DF_Usuarios_Activo DEFAULT 1
);

CREATE TABLE Categorias (
    IdCategoria INT IDENTITY(1,1) CONSTRAINT PK_Categorias PRIMARY KEY,
    Nombre      NVARCHAR(80)  NOT NULL CONSTRAINT UQ_Categorias_Nombre UNIQUE,
    Descripcion NVARCHAR(250) NULL
);

CREATE TABLE Productos (
    IdProducto   INT IDENTITY(1,1) CONSTRAINT PK_Productos PRIMARY KEY,
    Codigo       NVARCHAR(30)  NOT NULL CONSTRAINT UQ_Productos_Codigo UNIQUE,   -- RN1: código único
    Nombre       NVARCHAR(120) NOT NULL,
    Descripcion  NVARCHAR(300) NULL,
    IdCategoria  INT NOT NULL CONSTRAINT FK_Productos_Categorias REFERENCES Categorias(IdCategoria),
    PrecioCompra DECIMAL(10,2) NOT NULL CONSTRAINT CK_Productos_PrecioCompra CHECK (PrecioCompra > 0), -- RN2
    PrecioVenta  DECIMAL(10,2) NOT NULL CONSTRAINT CK_Productos_PrecioVenta  CHECK (PrecioVenta  > 0), -- RN2
    StockActual  INT NOT NULL CONSTRAINT DF_Productos_Stock DEFAULT 0
                     CONSTRAINT CK_Productos_StockActual CHECK (StockActual >= 0),                      -- RN4
    StockMinimo  INT NOT NULL CONSTRAINT CK_Productos_StockMinimo CHECK (StockMinimo >= 0),
    Activo       BIT NOT NULL CONSTRAINT DF_Productos_Activo DEFAULT 1                                  -- RN7
);

CREATE TABLE Movimientos (
    IdMovimiento   INT IDENTITY(1,1) CONSTRAINT PK_Movimientos PRIMARY KEY,
    IdProducto     INT NOT NULL CONSTRAINT FK_Movimientos_Productos REFERENCES Productos(IdProducto),
    Tipo           CHAR(1) NOT NULL CONSTRAINT CK_Movimientos_Tipo CHECK (Tipo IN ('E','S')),           -- E=Entrada, S=Salida
    Cantidad       INT NOT NULL CONSTRAINT CK_Movimientos_Cantidad CHECK (Cantidad > 0),                -- RN3
    Fecha          DATETIME2 NOT NULL,
    Motivo         NVARCHAR(200) NOT NULL,
    StockAnterior  INT NOT NULL,
    StockPosterior INT NOT NULL
);
GO
CREATE INDEX IX_Movimientos_Producto_Fecha ON Movimientos(IdProducto, Fecha);
GO
