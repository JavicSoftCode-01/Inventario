// BackEnd/models/models.js

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
    autorizaCompra,
    precioVentaPublico,
    fecha,
    hora
  ) {
    this.id = id;                 
    this.proveedor = proveedor;   
    this.ciudad = ciudad;         
    this.telefono = telefono;     
    this.correo = correo;         
    this.producto = producto;     
    this.precioProducto = precioProducto;    // número
    this.cantidad = cantidad;                // número
    this.autorizaCompra = autorizaCompra;
    this.precioVentaPublico = precioVentaPublico; // número
    this.fecha = fecha;
    this.hora = hora;
  }

  // Total a pagar = precioProducto * cantidad
  get totalPagar() {
    return this.precioProducto * this.cantidad;
  }

  // % de incremento = (precioVentaPublico - precioProducto) / precioProducto
  get porcentajeIncremento() {
    if (this.precioVentaPublico > 0 && this.precioProducto > 0) {
      return (this.precioVentaPublico - this.precioProducto) / this.precioProducto;
    }
    return 0;
  }

  // Diferencia en dólares
  get gananciaDolares() {
    return this.precioVentaPublico - this.precioProducto;
  }
}

export { Compra };
