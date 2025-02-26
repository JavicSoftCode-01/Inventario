// FrontEnd/static/scripts/app.js

import { Proveedor, Producto } from "../../../BackEnd/models/models.js";
import {
  getData,
  setData,
  getValue,
  setValue,
} from "../../../BackEnd/database/localStorage.js";

// Claves de localStorage
const KEY_PROVEEDORES = "proveedores";
const KEY_PRODUCTOS = "productos";
const KEY_TOTAL_COMPRAS = "totalCompras"; // acumulado de costos de compra

/* =======================================
    UTILIDADES GENERALES
======================================= */
function mostrarAlerta(mensaje) {
  // Simplemente un alert; podrías usar un div en la página si lo prefieres
  alert(mensaje);
}

/* =======================================
    CRUD DE PROVEEDORES
======================================= */
function obtenerProveedores() {
  return getData(KEY_PROVEEDORES);
}

function guardarProveedores(proveedores) {
  setData(KEY_PROVEEDORES, proveedores);
}

function crearProveedor(datos) {
  const proveedores = obtenerProveedores();
  const nuevoId = Date.now();
  const nuevoProveedor = new Proveedor(
    nuevoId,
    datos.nombre,
    datos.direccion,
    datos.telefono,
    datos.email,
    datos.contacto,
    datos.ciudad,
    datos.observaciones
  );
  proveedores.push(nuevoProveedor);
  guardarProveedores(proveedores);
  mostrarAlerta("Proveedor guardado con éxito.");
}

function actualizarProveedor(id, datos) {
  const proveedores = obtenerProveedores();
  const idx = proveedores.findIndex((p) => p.id === id);
  if (idx === -1) return;

  proveedores[idx].nombre = datos.nombre;
  proveedores[idx].direccion = datos.direccion;
  proveedores[idx].telefono = datos.telefono;
  proveedores[idx].email = datos.email;
  proveedores[idx].contacto = datos.contacto;
  proveedores[idx].ciudad = datos.ciudad;
  proveedores[idx].observaciones = datos.observaciones;

  guardarProveedores(proveedores);
  mostrarAlerta("Proveedor actualizado con éxito.");
}

function eliminarProveedor(id) {
  let proveedores = obtenerProveedores();
  proveedores = proveedores.filter((p) => p.id !== id);
  guardarProveedores(proveedores);
  mostrarAlerta("Proveedor eliminado.");
}

/* =======================================
    CRUD DE PRODUCTOS
======================================= */
function obtenerProductos() {
  return getData(KEY_PRODUCTOS);
}

function guardarProductos(productos) {
  setData(KEY_PRODUCTOS, productos);
}

function crearProducto(datos) {
  const productos = obtenerProductos();
  const nuevoId = Date.now();

  // Validación: stockTienda y stockProveedor no deben ser negativos
  if (datos.stockTienda < 0 || datos.stockProveedor < 0) {
    mostrarAlerta("El stock no puede ser negativo.");
    return;
  }

  const nuevoProducto = new Producto(
    nuevoId,
    datos.proveedorId,
    datos.marca,
    datos.nombre,
    datos.categoria,
    datos.stockTienda,
    datos.stockProveedor,
    datos.costoCompra,
    datos.precioVenta
  );

  productos.push(nuevoProducto);
  guardarProductos(productos);
  mostrarAlerta("Producto guardado con éxito.");
}

function actualizarProducto(id, datos) {
  const productos = obtenerProductos();
  const idx = productos.findIndex((p) => p.id === id);
  if (idx === -1) return;

  // Validación: stockTienda y stockProveedor no deben ser negativos
  if (datos.stockTienda < 0 || datos.stockProveedor < 0) {
    mostrarAlerta("El stock no puede ser negativo.");
    return;
  }

  productos[idx].proveedorId = datos.proveedorId;
  productos[idx].marca = datos.marca;
  productos[idx].nombre = datos.nombre;
  productos[idx].categoria = datos.categoria;
  productos[idx].stockTienda = datos.stockTienda;
  productos[idx].stockProveedor = datos.stockProveedor;
  productos[idx].costoCompra = datos.costoCompra;
  productos[idx].precioVenta = datos.precioVenta;

  guardarProductos(productos);
  mostrarAlerta("Producto actualizado con éxito.");
}

function eliminarProducto(id) {
  let productos = obtenerProductos();
  productos = productos.filter((p) => p.id !== id);
  guardarProductos(productos);
  mostrarAlerta("Producto eliminado.");
}

/* =======================================
    MANEJO DE STOCK
======================================= */

// Retorna el total de compras acumulado
function getTotalCompras() {
  return getValue(KEY_TOTAL_COMPRAS);
}

// Setea el total de compras
function setTotalCompras(valor) {
  setValue(KEY_TOTAL_COMPRAS, valor);
}

// “Comprar” significa: 
// - Pasar X cantidad de stock desde el "stockProveedor" al "stockTienda"
// - Sumar al total de compras (cantidad * costoCompra del producto)
function comprarProducto(productId, cantidad) {
  const productos = obtenerProductos();
  const idx = productos.findIndex((p) => p.id === productId);
  if (idx === -1) return;

  const producto = productos[idx];

  // Validar que el proveedor tenga suficiente stock
  if (cantidad > producto.stockProveedor) {
    mostrarAlerta("El proveedor no tiene suficiente stock para esa compra.");
    return;
  }
  if (cantidad <= 0) {
    mostrarAlerta("La cantidad debe ser mayor que 0.");
    return;
  }

  // Movemos stock
  producto.stockProveedor -= cantidad;
  producto.stockTienda += cantidad;

  // Calculamos costo total de esta compra
  const costoTotalCompra = cantidad * producto.costoCompra;
  let totalCompras = getTotalCompras();
  totalCompras += costoTotalCompra;
  setTotalCompras(totalCompras);

  guardarProductos(productos);
  mostrarAlerta(
    `Compra realizada. Se movieron ${cantidad} unidades. Costo: $${costoTotalCompra}`
  );
}

// “Devolver” significa:
// - Pasar X cantidad de stock desde "stockTienda" al "stockProveedor"
function devolverProducto(productId, cantidad) {
  const productos = obtenerProductos();
  const idx = productos.findIndex((p) => p.id === productId);
  if (idx === -1) return;

  const producto = productos[idx];

  // Validar que la tienda tenga suficiente stock para devolver
  if (cantidad > producto.stockTienda) {
    mostrarAlerta("No tienes suficiente stock en la tienda para devolver.");
    return;
  }
  if (cantidad <= 0) {
    mostrarAlerta("La cantidad debe ser mayor que 0.");
    return;
  }

  producto.stockTienda -= cantidad;
  producto.stockProveedor += cantidad;

  guardarProductos(productos);
  mostrarAlerta(`Se devolvieron ${cantidad} unidades al proveedor.`);
}

/* =======================================
    RENDER DE TABLAS Y SELECTS
======================================= */

// Ejemplo de render para Proveedores (tabla)
function renderizarTablaProveedores(contenedorTbodyId) {
  const tbody = document.getElementById(contenedorTbodyId);
  if (!tbody) return;

  const proveedores = obtenerProveedores();
  tbody.innerHTML = "";

  proveedores.forEach((prov) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${prov.nombre}</td>
      <td>${prov.direccion}</td>
      <td>${prov.telefono}</td>
      <td>${prov.email}</td>
      <td>${prov.contacto}</td>
      <td>${prov.ciudad}</td>
      <td>${prov.observaciones}</td>
      <td>
        <button class="btn-editar" data-id="${prov.id}">Editar</button>
        <button class="btn-eliminar" data-id="${prov.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

// Ejemplo de render para Productos (tabla)
function renderizarTablaProductos(contenedorTbodyId) {
  const tbody = document.getElementById(contenedorTbodyId);
  if (!tbody) return;

  const productos = obtenerProductos();
  const proveedores = obtenerProveedores();

  tbody.innerHTML = "";

  productos.forEach((prod) => {
    const prov = proveedores.find((p) => p.id === prod.proveedorId);
    const nombreProv = prov ? prov.nombre : "N/A";
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${nombreProv}</td>
      <td>${prod.marca}</td>
      <td>${prod.nombre}</td>
      <td>${prod.categoria}</td>
      <td>${prod.stockTienda}</td>
      <td>${prod.stockProveedor}</td>
      <td>$${prod.costoCompra}</td>
      <td>$${prod.precioVenta}</td>
      <td>
        <button class="btn-editar-producto" data-id="${prod.id}">Editar</button>
        <button class="btn-eliminar-producto" data-id="${prod.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

// Llenar un <select> con los proveedores
function llenarSelectProveedores(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const proveedores = obtenerProveedores();
  select.innerHTML = `<option value="">-- Seleccione --</option>`;
  proveedores.forEach((prov) => {
    const option = document.createElement("option");
    option.value = prov.id;
    option.textContent = prov.nombre;
    select.appendChild(option);
  });
}

// Llenar un <select> con los productos de un proveedor específico
function llenarSelectProductosDeProveedor(selectProveedorId, selectProductoId) {
  const proveedorSelect = document.getElementById(selectProveedorId);
  const productoSelect = document.getElementById(selectProductoId);
  if (!proveedorSelect || !productoSelect) return;

  const proveedorId = Number(proveedorSelect.value);
  const productos = obtenerProductos().filter((p) => p.proveedorId === proveedorId);

  productoSelect.innerHTML = `<option value="">-- Seleccione --</option>`;
  productos.forEach((prod) => {
    const option = document.createElement("option");
    option.value = prod.id;
    option.textContent = `${prod.marca} - ${prod.nombre}`;
    productoSelect.appendChild(option);
  });
}

/* =======================================
    EXPORTAR LAS FUNCIONES QUE USARÁS
======================================= */

export {
  // Proveedores
  obtenerProveedores,
  guardarProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  renderizarTablaProveedores,

  // Productos
  obtenerProductos,
  guardarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  renderizarTablaProductos,

  // Stock
  comprarProducto,
  devolverProducto,
  getTotalCompras,
  setTotalCompras,

  // Utilidades
  mostrarAlerta,
  llenarSelectProveedores,
  llenarSelectProductosDeProveedor
};
