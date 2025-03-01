import { Compra } from "../models/models.js";
import { getData, setData } from "../database/localStorage.js";
import { obtenerFechaYHora } from "../../FrontEnd/static/scripts/utils/datetime.js"; 

const KEY_COMPRAS = "compras";

function obtenerCompras() {
  return getData(KEY_COMPRAS) || [];
}

function guardarCompras(compras) {
  setData(KEY_COMPRAS, compras);
}

function crearCompra(datos) {
  const compras = obtenerCompras();
  const { fecha, hora } = obtenerFechaYHora();

  compras.push(
    new Compra(
      Date.now(),
      datos.proveedor,
      datos.ciudad,
      datos.telefono,
      datos.correo,
      datos.producto,
      +datos.precioProducto,
      +datos.cantidad,
      datos.autorizaCompra,
      +datos.precioVentaPublico,
      fecha,
      hora
    )
  );
  guardarCompras(compras);
}

function eliminarCompra(id) {
  const compras = obtenerCompras().filter((c) => c.id !== id);
  guardarCompras(compras);
}

function actualizarCompra(id, datos) {
  const compras = obtenerCompras();
  const idx = compras.findIndex((c) => c.id === id);
  if (idx === -1) return false;

  const compraOriginal = compras[idx];
  compras[idx] = new Compra(
    id,
    datos.proveedor,
    datos.ciudad,
    datos.telefono,
    datos.correo,
    datos.producto,
    +datos.precioProducto || 0,
    +datos.cantidad || 0,
    datos.autorizaCompra,
    +datos.precioVentaPublico || 0,
    compraOriginal.fecha,
    compraOriginal.hora
  );
  guardarCompras(compras);
  return true;
}

export {
  obtenerCompras,
  guardarCompras,
  crearCompra,
  eliminarCompra,
  actualizarCompra,
};
