// BackEnd/models/models.js

// Clase Proveedor
class Proveedor {
    constructor(
      id,
      nombre,
      direccion,
      telefono,
      email,
      contacto,
      ciudad,
      observaciones
    ) {
      this.id = id;
      this.nombre = nombre;
      this.direccion = direccion;
      this.telefono = telefono;
      this.email = email;
      this.contacto = contacto; // persona de contacto
      this.ciudad = ciudad;
      this.observaciones = observaciones;
    }
  }
  
  // Clase Producto
  class Producto {
    constructor(
      id,
      proveedorId,
      marca,
      nombre,
      categoria,
      stockTienda,
      stockProveedor,
      costoCompra,  // costo al comprarle al proveedor
      precioVenta   // precio de venta en la tienda
    ) {
      this.id = id;
      this.proveedorId = proveedorId;
      this.marca = marca;
      this.nombre = nombre;
      this.categoria = categoria;
      this.stockTienda = stockTienda;
      this.stockProveedor = stockProveedor; 
      this.costoCompra = costoCompra;
      this.precioVenta = precioVenta;
    }
  }
  
  export { Proveedor, Producto };
  