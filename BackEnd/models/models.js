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
    nombreUsuario,
    autorizador
  ) {
    this.id = id;
    this.proveedor = proveedor;
    this.ciudad = ciudad;
    this.telefono = telefono;
    this.correo = correo;
    this.producto = producto;
    this.precioProducto = Number(precioProducto);
    this.cantidad = Number(cantidad);
    this.stock = Number(cantidad); // Inicializar stock con la cantidad
    this.productosVendidos = 0;
    this.precioVentaPublico = Number(precioVentaPublico);
    this.fecha = fecha;
    this.hora = hora;
    this.nombreUsuario = nombreUsuario;
    this.autorizador = autorizador;
  }

  actualizarStock(cantidad) {
    this.stock = Math.max(0, Math.min(this.cantidad, cantidad));
    this.productosVendidos = this.cantidad - this.stock;
    return true;
  }

  calcularGananciaVentas() {
    const gananciaUnitaria = this.precioVentaPublico - this.precioProducto;
    return (this.productosVendidos || 0) * (gananciaUnitaria || 0);
  }

  calcularVentasTotales() {
    return (this.productosVendidos || 0) * (this.precioVentaPublico || 0);
  }
}

export { Compra };