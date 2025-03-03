class Compra {
  constructor(
    id,
    proveedor,
    ciudad,
    telefono,
    correo,
    producto,
    precioProducto,
    cantidad,
    precioVentaPublico,
    fecha,
    hora,
    nombreUsuario 
  ) {
    this.id = id;
    this.proveedor = proveedor;
    this.ciudad = ciudad;
    this.telefono = telefono;
    this.correo = correo;
    this.producto = producto;
    this.precioProducto = precioProducto;
    this.cantidad = cantidad;
    this.precioVentaPublico = precioVentaPublico;
    this.fecha = fecha;
    this.hora = hora;
    this.nombreUsuario = nombreUsuario; 
  }
}

export { Compra };