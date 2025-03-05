//import {Compra} from "../models/models.js";
//import {getData, setData} from "../database/localStorage.js";
//import {obtenerFechaYHora} from "../../FrontEnd/static/scripts/utils/datetime.js";
//import {obtenerSesionActual, esUsuarioPropietario} from "./usuarioServices.js";
//
//const KEY_COMPRAS = "compras";
//
//function obtenerCompras() {
//    return getData(KEY_COMPRAS) || [];
//}
//
//function guardarCompras(compras) {
//    setData(KEY_COMPRAS, compras);
//}
//
//
//function crearCompra(datos) {
//    const compras = obtenerCompras();
//    const {fecha, hora} = obtenerFechaYHora();
//    const sesionActual = obtenerSesionActual();
//
//    // Usar el nombre completo del usuario logueado
//    // const nombreCompletoUsuario = sesionActual ? sesionActual.nombreUsuario : "Sin autorización";
//    const nombreCompletoUsuario = sesionActual ? sesionActual.nombreUsuario : "Sin autorización";
//    const autorizado = sesionActual ? sesionActual.nombres + " " + sesionActual.apellidos: "Sin autorización";
//
//    const nuevaCompra = new Compra(
//        Date.now(),
//        datos.proveedor,
//        datos.ciudad,
//        datos.telefono,
//        datos.correo,
//        datos.producto,
//        +datos.precioProducto,
//        +datos.cantidad,
//        +datos.precioVentaPublico, // Precio de venta al público
//        fecha,
//        hora,
//        nombreCompletoUsuario, // Se almacena en la compra quién la creó
//        autorizado
//    );
//
//    compras.push(nuevaCompra);
//    guardarCompras(compras);
//}
//
//
//function eliminarCompra(id) {
//    const compras = obtenerCompras();
//    const compraAEliminar = compras.find(c => c.id === id);
//
//    if (!compraAEliminar || !esUsuarioPropietario(null, compraAEliminar.nombreUsuario)) {
//        return {
//            exito: false,
//            mensaje: "No tienes permisos para eliminar este registro"
//        };
//    }
//
//    const nuevasCompras = compras.filter((c) => c.id !== id);
//    guardarCompras(nuevasCompras);
//
//    return {
//        exito: true,
//        mensaje: "Registro eliminado con éxito"
//    };
//}
//
//
//function actualizarCompra(id, datos) {
//    const compras = obtenerCompras();
//    const idx = compras.findIndex((c) => c.id === id);
//
//    if (idx === -1) return {
//        exito: false,
//        mensaje: "El registro no existe"
//    };
//
//    const compraOriginal = compras[idx];
//
//    // Verificar si el usuario actual es quien creó el registro
//    // if (!esUsuarioPropietario(null, compraOriginal.nombreCompleto)) {
//    if (!esUsuarioPropietario(null, compraOriginal.nombreUsuario)) {
//        return {
//            exito: false,
//            mensaje: "No tienes permisos para actualizar este registro"
//        };
//    }
//
//    // compras[idx] = new Compra(
//    //     id,
//    //     datos.proveedor,
//    //     datos.ciudad,
//    //     datos.telefono,
//    //     datos.correo,
//    //     datos.producto,
//    //     +datos.precioProducto || 0,
//    //     +datos.cantidad || 0,
//    //     compraOriginal.nombreCompleto, // Mantener el autorizador original
//    //     +datos.precioVentaPublico || 0,
//    //     compraOriginal.fecha,
//    //     compraOriginal.hora
//    // );
//    compras[idx] = new Compra(
//        id,
//        datos.proveedor,
//        datos.ciudad,
//        datos.telefono,
//        datos.correo,
//        datos.producto,
//        +datos.precioProducto || 0,
//        +datos.cantidad || 0,
//        +datos.precioVentaPublico || 0,
//        compraOriginal.fecha,
//        compraOriginal.hora,
//        compraOriginal.nombreUsuario // Mantener el usuario original
//    );
//    guardarCompras(compras);
//
//    return {
//        exito: true,
//        mensaje: "Registro actualizado con éxito"
//    };
//}
//
//export {
//    obtenerCompras,
//    guardarCompras,
//    crearCompra,
//    eliminarCompra,
//    actualizarCompra,
//};

//import { Compra } from "../models/models.js";
//import { LocalStorageManager } from "../database/localStorage.js";
//import { DateTimeManager } from "../../FrontEnd/static/scripts/utils/datetime.js";
//import { UserManager } from "./usuarioServices.js";
//
///**
// * Clase para gestionar operaciones relacionadas con las compras.
// */
//class PurchaseService {
//  // Clave del localStorage para las compras
//  static KEY_PURCHASES = "compras";
//
//  /**
//   * Obtiene todas las compras desde el localStorage.
//   * @returns {Array} Lista de compras.
//   */
//  static getPurchases() {
//    try {
//      const purchases = LocalStorageManager.getData(this.KEY_PURCHASES);
//      return purchases || [];
//    } catch (error) {
//      console.error("Error al obtener compras:", error);
//      return [];
//    }
//  }
//
//  /**
//   * Guarda la lista de compras en el localStorage.
//   * @param {Array} purchases - Lista de compras a guardar.
//   */
//  static savePurchases(purchases) {
//    try {
//      LocalStorageManager.setData(this.KEY_PURCHASES, purchases);
//    } catch (error) {
//      console.error("Error al guardar compras:", error);
//    }
//  }
//
//  /**
//   * Crea una nueva compra.
//   * @param {Object} data - Datos de la compra.
//   * @returns {Object} Resultado de la operación.
//   */
//  static createPurchase(data) {
//    try {
//      const purchases = this.getPurchases();
//      const { fecha, hora } = DateTimeManager.getDateTime();
//      const session = UserManager.getCurrentSession();
//
//      // Obtener el nombre de usuario y el autorizador (totalmente en español en los mensajes)
//      const userName = session ? session.nombreUsuario : "Sin autorización";
//      const authorizedBy = session ? `${session.nombres} ${session.apellidos}` : "Sin autorización";
//
//      const newPurchase = new Compra(
//        Date.now(),
//        data.proveedor,
//        data.ciudad,
//        data.telefono,
//        data.correo,
//        data.producto,
//        Number(data.precioProducto),
//        Number(data.cantidad),
//        Number(data.precioVentaPublico), // Precio de venta al público
//        fecha,
//        hora,
//        userName,    // Usuario que crea la compra
//        authorizedBy // Autorizador
//      );
//
//      purchases.push(newPurchase);
//      this.savePurchases(purchases);
//
//      return { success: true, message: "Compra creada con éxito" };
//    } catch (error) {
//      console.error("Error al crear compra:", error);
//      return { success: false, message: "Error al crear la compra" };
//    }
//  }
//
//  /**
//   * Elimina una compra según su id.
//   * @param {number} id - Id de la compra a eliminar.
//   * @returns {Object} Resultado de la operación.
//   */
//  static deletePurchase(id) {
//    try {
//      const purchases = this.getPurchases();
//      const purchaseToDelete = purchases.find(c => c.id === id);
//
//      if (!purchaseToDelete || !UserManager.isUserOwner(purchaseToDelete.nombreUsuario)) {
//        return { success: false, message: "No tienes permisos para eliminar este registro" };
//      }
//
//      const newPurchases = purchases.filter(c => c.id !== id);
//      this.savePurchases(newPurchases);
//
//      return { success: true, message: "Registro eliminado con éxito" };
//    } catch (error) {
//      console.error("Error al eliminar compra:", error);
//      return { success: false, message: "Error al eliminar la compra" };
//    }
//  }
//
//  /**
//   * Actualiza una compra existente.
//   * @param {number} id - Id de la compra a actualizar.
//   * @param {Object} data - Datos actualizados de la compra.
//   * @returns {Object} Resultado de la operación.
//   */
//  static updatePurchase(id, data) {
//    try {
//      const purchases = this.getPurchases();
//      const index = purchases.findIndex(c => c.id === id);
//
//      if (index === -1) {
//        return { success: false, message: "El registro no existe" };
//      }
//
//      const originalPurchase = purchases[index];
//
//      // Verificar si el usuario actual es el propietario de la compra
//      if (!UserManager.isUserOwner(originalPurchase.nombreUsuario)) {
//        return { success: false, message: "No tienes permisos para actualizar este registro" };
//      }
//
//      // Conservar la fecha, hora y usuario original
//      const updatedPurchase = new Compra(
//        id,
//        data.proveedor,
//        data.ciudad,
//        data.telefono,
//        data.correo,
//        data.producto,
//        Number(data.precioProducto) || 0,
//        Number(data.cantidad) || 0,
//        Number(data.precioVentaPublico) || 0,
//        originalPurchase.fecha,
//        originalPurchase.hora,
//        originalPurchase.nombreUsuario, // Mantener el usuario original
//        originalPurchase.autorizador    // Mantener el autorizador original
//      );
//
//      purchases[index] = updatedPurchase;
//      this.savePurchases(purchases);
//
//      return { success: true, message: "Registro actualizado con éxito" };
//    } catch (error) {
//      console.error("Error al actualizar compra:", error);
//      return { success: false, message: "Error al actualizar la compra" };
//    }
//  }
//}
//
//export { PurchaseService };

import { Compra } from "../models/models.js";
import { LocalStorageManager } from "../database/localStorage.js";
import { DateTimeManager } from "../../FrontEnd/static/scripts/utils/datetime.js";
import { UserManager } from "./usuarioServices.js";

/**
 * Clase para gestionar operaciones relacionadas con las compras.
 */
class PurchaseService {
  // Clave del localStorage para las compras
  static KEY_PURCHASES = "compras";

  /**
   * Obtiene todas las compras desde el localStorage.
   * @returns {Array} Lista de compras.
   */
  static getPurchases() {
    return LocalStorageManager.getData(this.KEY_PURCHASES);
  }

  /**
   * Crea una nueva compra.
   * @param {Object} data - Datos de la compra.
   * @returns {Object} Resultado de la operación.
   */
  static createPurchase(data) {
    try {
      const { fecha, hora } = DateTimeManager.getDateTime();
      const session = UserManager.getCurrentSession();

      if (!session) {
        return {
          success: false,
          message: "No hay sesión activa"
        };
      }

      // Asegurarse de que estos valores se guarden correctamente
      const userName = session.nombreUsuario;
      const authorizedBy = `${session.nombres} ${session.apellidos}`;

      const newPurchase = new Compra(
        Date.now(),
        data.proveedor,
        data.ciudad,
        data.telefono,
        data.correo,
        data.producto,
        Number(data.precioProducto),
        Number(data.cantidad),
        Number(data.precioVentaPublico),
        fecha,
        hora,
        userName,    // Usuario que crea la compra
        authorizedBy // Nombre completo del autorizador
      );

      const result = LocalStorageManager.create(this.KEY_PURCHASES, newPurchase);

      console.log('Compra creada:', newPurchase); // Para debug

      return {
        success: result,
        message: result ? "Compra creada con éxito" : "Error al crear la compra"
      };
    } catch (error) {
      console.error("Error al crear compra:", error);
      return { success: false, message: "Error al crear la compra" };
    }
  }

  /**
   * Elimina una compra según su id.
   * @param {number} id - Id de la compra a eliminar.
   * @returns {Object} Resultado de la operación.
   */
  static deletePurchase(id) {
    try {
      // Primero, verificar permisos
      const purchases = this.getPurchases();
      const purchaseToDelete = purchases.find(c => c.id === id);

      if (!purchaseToDelete || !UserManager.isUserOwner(purchaseToDelete.nombreUsuario)) {
        return { success: false, message: "No tienes permisos para eliminar este registro" };
      }

      // Intentar eliminar
      const result = LocalStorageManager.delete(this.KEY_PURCHASES, id);

      return {
        success: result,
        message: result
          ? "Registro eliminado con éxito"
          : "Error al eliminar la compra"
      };
    } catch (error) {
      console.error("Error al eliminar compra:", error);
      return { success: false, message: "Error al eliminar la compra" };
    }
  }

  /**
   * Actualiza una compra existente.
   * @param {number} id - Id de la compra a actualizar.
   * @param {Object} data - Datos actualizados de la compra.
   * @returns {Object} Resultado de la operación.
   */
  static updatePurchase(id, data) {
    try {
      // Primero, obtener la compra original para verificar permisos
      const purchases = this.getPurchases();
      const originalPurchase = purchases.find(c => c.id === id);

      // Verificar si el usuario actual es el propietario de la compra
      if (!originalPurchase || !UserManager.isUserOwner(originalPurchase.nombreUsuario)) {
        return { success: false, message: "No tienes permisos para actualizar este registro" };
      }

      // Preparar datos actualizados, conservando información original
      const updatedPurchase = {
        ...originalPurchase,
        proveedor: data.proveedor,
        ciudad: data.ciudad,
        telefono: data.telefono,
        correo: data.correo,
        producto: data.producto,
        precioProducto: Number(data.precioProducto) || originalPurchase.precioProducto,
        cantidad: Number(data.cantidad) || originalPurchase.cantidad,
        precioVentaPublico: Number(data.precioVentaPublico) || originalPurchase.precioVentaPublico
      };

      // Intentar actualizar
      const result = LocalStorageManager.update(this.KEY_PURCHASES, id, updatedPurchase);

      return {
        success: result,
        message: result
          ? "Registro actualizado con éxito"
          : "Error al actualizar la compra"
      };
    } catch (error) {
      console.error("Error al actualizar compra:", error);
      return { success: false, message: "Error al actualizar la compra" };
    }
  }
}

export { PurchaseService };