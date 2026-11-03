-- Datos de prueba. Usuario: admin / admin123
USE TecnoStockDB;
GO
INSERT INTO Usuarios (Username, PasswordHash, NombreCompleto)
VALUES ('admin', HASHBYTES('SHA2_256', 'admin123'), 'Administrador TecnoStock');

INSERT INTO Categorias (Nombre, Descripcion) VALUES
 ('Laptops', 'Computadoras portátiles'),
 ('Periféricos', 'Mouse, teclados y similares'),
 ('Almacenamiento', 'Discos, memorias USB y SSD');

EXEC sp_Producto_Crear 'LAP-001', 'Laptop Lenovo IdeaPad 15', 'Core i5, 8GB RAM, 512GB SSD', 1, 1800, 2300, 3;
EXEC sp_Producto_Crear 'MOU-001', 'Mouse inalámbrico Logitech', 'Mouse óptico 2.4GHz', 2, 25, 45, 10;
EXEC sp_Producto_Crear 'SSD-001', 'SSD Kingston 480GB', 'SATA III 2.5"', 3, 120, 175, 5;

DECLARE @ahora DATETIME2 = SYSDATETIME();
EXEC sp_Movimiento_RegistrarEntrada 1, 10, @ahora, 'Compra inicial';
EXEC sp_Movimiento_RegistrarEntrada 2, 8,  @ahora, 'Compra inicial';
EXEC sp_Movimiento_RegistrarEntrada 3, 20, @ahora, 'Compra inicial';
EXEC sp_Movimiento_RegistrarSalida  1, 8,  @ahora, 'Venta a cliente';   -- deja la laptop con stock bajo
GO
