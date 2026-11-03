// Interfaces: describen la forma de los datos que devuelve la API (mismos nombres que los Schemas de Python)
export interface Usuario {
  id_usuario: number;
  username: string;
  nombre_completo: string;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
}

export interface Producto {
  id_producto: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  id_categoria: number;
  categoria: string;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  activo: boolean;
}

export interface ProductoGuardar {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  id_categoria: number;
  precio_compra: number;
  precio_venta: number;
  stock_minimo: number;
}

export interface Movimiento {
  id_movimiento: number;
  id_producto: number;
  codigo: string;
  producto: string;
  tipo: 'E' | 'S';
  cantidad: number;
  fecha: string;
  motivo: string;
  stock_anterior: number;
  stock_posterior: number;
}

export interface MovimientoGuardar {
  id_producto: number;
  cantidad: number;
  fecha: string;
  motivo: string;
}

export interface Dashboard {
  productos_activos: number;
  productos_stock_bajo: number;
  valor_inventario: number;
}
