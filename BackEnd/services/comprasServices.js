import {Compra} from "../models/models.js";
import {getData, setData} from "../database/localStorage.js";
import {obtenerFechaYHora} from "../../FrontEnd/static/scripts/utils/datetime.js";
import {obtenerSesionActual, esUsuarioPropietario} from "./usuarioServices.js";

const KEY_COMPRAS = "compras";

function obtenerCompras() {
    return getData(KEY_COMPRAS) || [];
}

function guardarCompras(compras) {
    setData(KEY_COMPRAS, compras);
}


function crearCompra(datos) {
    const compras = obtenerCompras();
    const {fecha, hora} = obtenerFechaYHora();
    const sesionActual = obtenerSesionActual();

    // Usar el nombre completo del usuario logueado
    // const nombreCompletoUsuario = sesionActual ? sesionActual.nombreUsuario : "Sin autorización";
    const nombreCompletoUsuario = sesionActual ? sesionActual.nombreUsuario : "Sin autorización";

    const nuevaCompra = new Compra(
        Date.now(),
        datos.proveedor,
        datos.ciudad,
        datos.telefono,
        datos.correo,
        datos.producto,
        +datos.precioProducto,
        +datos.cantidad,
        +datos.precioVentaPublico, // Precio de venta al público
        fecha,
        hora,
        nombreCompletoUsuario // Se almacena en la compra quién la creó
    );

    compras.push(nuevaCompra);
    guardarCompras(compras);
}


function eliminarCompra(id) {
    const compras = obtenerCompras();
    const compraAEliminar = compras.find(c => c.id === id);

    if (!compraAEliminar || !esUsuarioPropietario(null, compraAEliminar.nombreUsuario)) {
        return {
            exito: false,
            mensaje: "No tienes permisos para eliminar este registro"
        };
    }

    const nuevasCompras = compras.filter((c) => c.id !== id);
    guardarCompras(nuevasCompras);

    return {
        exito: true,
        mensaje: "Registro eliminado con éxito"
    };
}


function actualizarCompra(id, datos) {
    const compras = obtenerCompras();
    const idx = compras.findIndex((c) => c.id === id);

    if (idx === -1) return {
        exito: false,
        mensaje: "El registro no existe"
    };

    const compraOriginal = compras[idx];

    // Verificar si el usuario actual es quien creó el registro
    // if (!esUsuarioPropietario(null, compraOriginal.nombreCompleto)) {
    if (!esUsuarioPropietario(null, compraOriginal.nombreUsuario)) {
        return {
            exito: false,
            mensaje: "No tienes permisos para actualizar este registro"
        };
    }

    // compras[idx] = new Compra(
    //     id,
    //     datos.proveedor,
    //     datos.ciudad,
    //     datos.telefono,
    //     datos.correo,
    //     datos.producto,
    //     +datos.precioProducto || 0,
    //     +datos.cantidad || 0,
    //     compraOriginal.nombreCompleto, // Mantener el autorizador original
    //     +datos.precioVentaPublico || 0,
    //     compraOriginal.fecha,
    //     compraOriginal.hora
    // );
    compras[idx] = new Compra(
        id,
        datos.proveedor,
        datos.ciudad,
        datos.telefono,
        datos.correo,
        datos.producto,
        +datos.precioProducto || 0,
        +datos.cantidad || 0,
        +datos.precioVentaPublico || 0,
        compraOriginal.fecha,
        compraOriginal.hora,
        compraOriginal.nombreUsuario // Mantener el usuario original
    );
    guardarCompras(compras);

    return {
        exito: true,
        mensaje: "Registro actualizado con éxito"
    };
}

export {
    obtenerCompras,
    guardarCompras,
    crearCompra,
    eliminarCompra,
    actualizarCompra,
};