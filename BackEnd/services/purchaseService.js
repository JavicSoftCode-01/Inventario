// import {Compra} from "../models/models.js";
// import {LocalStorageManager} from "../database/localStorage.js";
// import {DateTimeManager} from "../../FrontEnd/static/scripts/utils/datetime.js";
// import {AuthManager} from "./authServices.js";
// import {NotificationManager} from "../../FrontEnd/static/scripts/utils/showNotifications.js";
// import {ExecuteManager} from "../utils/execute.js";
//
// class PurchaseService {
//   static KEY_PURCHASES = "compras";
//
//   /**
//    *  🔰 Obtiene todas las compras almacenadas en el LocalStorage. 🔰
//    */
//   static getPurchases() {
//     return ExecuteManager.execute(() => LocalStorageManager.getData(this.KEY_PURCHASES) || [], "Compras obtenidas exitosamente.", "Error al obtener las compras:");
//   }
//
//   /**
//    *  🔰 Crea un nuevo registro. 🔰
//    */
//   static createPurchase(data) {
//     return ExecuteManager.execute(() => {
//       const session = AuthManager.getCurrentSession();
//       if (!session) {
//         NotificationManager.info("No hay sesión activa");
//         throw new Error("No hay sesión activa");
//       }
//
//       const {fecha, hora} = DateTimeManager.getDateTime();
//       const newPurchase = new Compra(Date.now(), data.proveedor, data.ciudad, data.telefono, data.correo, data.producto, Number(data.precioProducto), Number(data.cantidad), Number(data.precioVentaPublico), fecha, hora, session.nombreUsuario, `${session.nombres} ${session.apellidos}`);
//
//       const result = LocalStorageManager.create(this.KEY_PURCHASES, newPurchase);
//       if (result) {
//         NotificationManager.success("Exito! Compra creada");
//       } else {
//         NotificationManager.error("Error! Al crear la compra");
//         throw new Error("Error al crear la compra");
//       }
//     }, "Exito! Compra creada.", "Error! Al crear la compra:");
//   }
//
//   /**
//    *  🔰 Actualiza un registro, sí el usuario tiene permisos. 🔰
//    */
//   static updatePurchase(id, data) {
//     return ExecuteManager.execute(() => {
//       const purchases = this.getPurchases();
//       const purchase = purchases.find(p => p.id === Number(id));
//
//       if (!purchase) {
//         NotificationManager.info("Registro no encontrado");
//         return false;
//       }
//
//       // Get current session and check permissions
//       const session = AuthManager.getCurrentSession();
//       if (!session || session.nombreUsuario !== purchase.nombreUsuario) {
//         NotificationManager.info("No tienes permisos para actualizar este registro");
//         return false;
//       }
//
//       const newQuantity = Number(data.cantidad) || purchase.cantidad;
//       const updatedPurchase = {
//         ...purchase,
//         ...data,
//         id: Number(id), // Ensure ID remains the same
//         precioProducto: Number(data.precioProducto) || purchase.precioProducto,
//         cantidad: newQuantity,
//         precioVentaPublico: Number(data.precioVentaPublico) || purchase.precioVentaPublico,
//         stock: newQuantity,
//         productosVendidos: 0,
//         nombreUsuario: purchase.nombreUsuario, // Preserve original owner
//         autorizador: purchase.autorizador // Preserve original authorizer
//       };
//
//       const result = LocalStorageManager.update(this.KEY_PURCHASES, Number(id), updatedPurchase);
//       if (result) {
//         NotificationManager.success("Exito! Registro actualizado");
//         return true;
//       } else {
//         NotificationManager.error("Error! Al actualizar el registro");
//         return false;
//       }
//     }, "Exito! Registro actualizado", "Error! Al actualizar el registro:");
//   }
//
//   /**
//    *  🔰 Elimina un registro,  sí el usuario tiene permisos. 🔰
//    */
//   static deletePurchase(id) {
//     return ExecuteManager.execute(() => {
//       const purchases = this.getPurchases();
//       const purchase = purchases.find(p => p.id === Number(id));
//
//       if (!purchase) {
//         NotificationManager.info("Registro no encontrado");
//         return false;
//       }
//
//       // Get current session and check permissions
//       const session = AuthManager.getCurrentSession();
//       if (!session || session.nombreUsuario !== purchase.nombreUsuario) {
//         NotificationManager.info("No tienes permisos para eliminar este registro");
//         return false;
//       }
//
//       const result = LocalStorageManager.delete(this.KEY_PURCHASES, Number(id));
//       if (result) {
//         NotificationManager.success("Exito! Registro eliminado");
//         return true;
//       } else {
//         NotificationManager.error("Error! Al eliminar el registro");
//         return false;
//       }
//     }, "Exito! Registro eliminado", "Error! Al eliminar el registro:");
//   }
//
//   /**
//    *  🔰 Actualiza el stock y notifica si el stock es insuficiente o se ha agotado. 🔰
//    */
//   static updateStock(id, change) {
//     return ExecuteManager.execute(() => {
//       const purchases = this.getPurchases();
//       const purchaseIndex = purchases.findIndex(p => p.id === id);
//       if (purchaseIndex === -1) {
//         NotificationManager.info("Compra no encontrada");
//         throw new Error("Compra no encontrada");
//       }
//
//       const purchase = purchases[purchaseIndex];
//       const nuevoStock = purchase.stock + change;
//
//       if (nuevoStock < 0 || nuevoStock > purchase.cantidad) {
//         NotificationManager.warning(`No se puede ${change > 0 ? 'aumentar' : 'disminuir'} más el stock`);
//         return {success: false};
//       }
//
//       const updatedPurchase = {
//         ...purchase,
//         stock: nuevoStock,
//         productosVendidos: purchase.cantidad - nuevoStock
//       };
//
//       if (nuevoStock === 0) {
//         NotificationManager.warning(`¡Atención! Se han agotado el producto ${purchase.producto}`);
//       }
//
//       LocalStorageManager.update(this.KEY_PURCHASES, id, updatedPurchase);
//       return {
//         success: true,
//         updatedPurchase
//       };
//     }, "Exito! Actualizando stock.", "Error! Al actualizar stock:");
//   }
// }
//
// export {PurchaseService};

// BackEnd/services/purchaseService.js

import {Compra} from "../models/models.js";
import {LocalStorageManager} from "../database/localStorage.js";
import {DateTimeManager} from "../../FrontEnd/static/scripts/utils/datetime.js";
import {AuthManager} from "./authServices.js";
import {NotificationManager} from "../../FrontEnd/static/scripts/utils/showNotifications.js";
import {ExecuteManager} from "../utils/execute.js";

// IMPORTA la función para sincronizar con Google Sheets
import {syncWithGoogleSheet} from "./syncGoogleSheet.js";

class PurchaseService {
  static KEY_PURCHASES = "compras";

  /**
   *  🔰 Obtiene todas las compras almacenadas en el LocalStorage. 🔰
   */
  static getPurchases() {
    return ExecuteManager.execute(
      () => LocalStorageManager.getData(this.KEY_PURCHASES) || [],
      "Compras obtenidas exitosamente.",
      "Error al obtener las compras:"
    );
  }

  /**
   *  🔰 Crea un nuevo registro. 🔰
   */
  static createPurchase(data) {
    return ExecuteManager.execute(() => {
        const session = AuthManager.getCurrentSession();
        if (!session) {
          NotificationManager.info("No hay sesión activa");
          throw new Error("No hay sesión activa");
        }

        const {fecha, hora} = DateTimeManager.getDateTime();
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
          session.nombreUsuario,
          `${session.nombres} ${session.apellidos}`
        );

        const result = LocalStorageManager.create(this.KEY_PURCHASES, newPurchase);
        if (result) {
          NotificationManager.success("Exito! Compra creada");

          // ─────────────────────────────────────────────────────────────
          // SINCRONIZACIÓN CON GOOGLE SHEET (acción 'create')
          // ─────────────────────────────────────────────────────────────

          // 1) Calcula índice de fila (ejemplo: +2 si la fila 1 es la cabecera)
          const purchases = this.getPurchases();
          const rowIndex = purchases.findIndex(p => p.id === newPurchase.id) + 2;

          // 2) Realiza cálculos financieros simples (ajusta a tu gusto)
          const total = newPurchase.precioProducto * newPurchase.cantidad;
          const gananciaUnitaria = 0; // Ajusta si deseas
          const ventasTotales = 0;
          const gananciaPorVentas = 0;

          // 3) Crea el objeto de datos para la hoja
          const dataToSync = {
            fila: rowIndex,
            proveedor: newPurchase.proveedor,
            ciudad: newPurchase.ciudad,
            telefono: newPurchase.telefono,
            correo: newPurchase.correo,
            producto: newPurchase.producto,
            precio: newPurchase.precioProducto.toFixed(2),
            cantidad: newPurchase.cantidad,
            total: total.toFixed(2),
            gananciaUnitaria: gananciaUnitaria.toFixed(2),
            precioVentaPublico: newPurchase.precioVentaPublico.toFixed(2),
            stock: newPurchase.cantidad,
            productosVendidos: 0,
            ventasTotales: ventasTotales.toFixed(2),
            gananciaPorVentas: gananciaPorVentas.toFixed(2),
            autoriza: newPurchase.autorizador || "No especificado",
            fecha: newPurchase.fecha,
            hora: newPurchase.hora
          };

          // 4) Envía la petición 'create' a Google Sheets
          syncWithGoogleSheet("create", dataToSync);
        } else {
          NotificationManager.error("Error! Al crear la compra");
          throw new Error("Error al crear la compra");
        }
      },
      "Exito! Compra creada.",
      "Error! Al crear la compra:");
  }

  /**
   *  🔰 Actualiza un registro, sí el usuario tiene permisos. 🔰
   */
  static updatePurchase(id, data) {
    return ExecuteManager.execute(() => {
        const purchases = this.getPurchases();
        const purchase = purchases.find(p => p.id === Number(id));

        if (!purchase) {
          NotificationManager.info("Registro no encontrado");
          return false;
        }

        // Get current session and check permissions
        const session = AuthManager.getCurrentSession();
        if (!session || session.nombreUsuario !== purchase.nombreUsuario) {
          NotificationManager.info("No tienes permisos para actualizar este registro");
          return false;
        }

        const newQuantity = Number(data.cantidad) || purchase.cantidad;
        const updatedPurchase = {
          ...purchase,
          ...data,
          id: Number(id), // Ensure ID remains the same
          precioProducto: Number(data.precioProducto) || purchase.precioProducto,
          cantidad: newQuantity,
          precioVentaPublico: Number(data.precioVentaPublico) || purchase.precioVentaPublico,
          stock: newQuantity,
          productosVendidos: 0,
          nombreUsuario: purchase.nombreUsuario, // Preserve original owner
          autorizador: purchase.autorizador // Preserve original authorizer
        };

        const result = LocalStorageManager.update(this.KEY_PURCHASES, Number(id), updatedPurchase);
        if (result) {
          NotificationManager.success("Exito! Registro actualizado");

          // ─────────────────────────────────────────────────────────────
          // SINCRONIZACIÓN CON GOOGLE SHEET (acción 'update')
          // ─────────────────────────────────────────────────────────────

          // 1) Calcula el índice de fila
          const rowIndex = purchases.findIndex(p => p.id === Number(id)) + 2;

          // 2) Cálculos financieros (ajusta a tu gusto)
          const total = updatedPurchase.precioProducto * updatedPurchase.cantidad;
          const gananciaUnitaria = 0; // Ajusta si deseas
          const ventasTotales = 0;
          const gananciaPorVentas = 0;

          // 3) Crea el objeto de datos
          const dataToSync = {
            fila: rowIndex,
            proveedor: updatedPurchase.proveedor,
            ciudad: updatedPurchase.ciudad,
            telefono: updatedPurchase.telefono,
            correo: updatedPurchase.correo,
            producto: updatedPurchase.producto,
            precio: updatedPurchase.precioProducto.toFixed(2),
            cantidad: updatedPurchase.cantidad,
            total: total.toFixed(2),
            gananciaUnitaria: gananciaUnitaria.toFixed(2),
            precioVentaPublico: updatedPurchase.precioVentaPublico.toFixed(2),
            stock: updatedPurchase.stock,
            productosVendidos: updatedPurchase.productosVendidos,
            ventasTotales: ventasTotales.toFixed(2),
            gananciaPorVentas: gananciaPorVentas.toFixed(2),
            autoriza: updatedPurchase.autorizador || "No especificado",
            fecha: updatedPurchase.fecha,
            hora: updatedPurchase.hora
          };

          // 4) Llamada 'update' al Google Sheets
          syncWithGoogleSheet("update", dataToSync);

          return true;
        } else {
          NotificationManager.error("Error! Al actualizar el registro");
          return false;
        }
      },
      "Exito! Registro actualizado",
      "Error! Al actualizar el registro:");
  }

  /**
   *  🔰 Elimina un registro, sí el usuario tiene permisos. 🔰
   */
  static deletePurchase(id) {
    return ExecuteManager.execute(() => {
        const purchases = this.getPurchases();
        const purchase = purchases.find(p => p.id === Number(id));

        if (!purchase) {
          NotificationManager.info("Registro no encontrado");
          return false;
        }

        // Get current session and check permissions
        const session = AuthManager.getCurrentSession();
        if (!session || session.nombreUsuario !== purchase.nombreUsuario) {
          NotificationManager.info("No tienes permisos para eliminar este registro");
          return false;
        }

        const result = LocalStorageManager.delete(this.KEY_PURCHASES, Number(id));
        if (result) {
          NotificationManager.success("Exito! Registro eliminado");

          // ─────────────────────────────────────────────────────────────
          // SINCRONIZACIÓN CON GOOGLE SHEET (acción 'delete')
          // ─────────────────────────────────────────────────────────────

          // 1) Calcula el índice de fila
          const rowIndex = purchases.findIndex(p => p.id === Number(id)) + 2;

          // 2) Envía petición 'delete' con el número de fila
          syncWithGoogleSheet("delete", {fila: rowIndex});

          return true;
        } else {
          NotificationManager.error("Error! Al eliminar el registro");
          return false;
        }
      },
      "Exito! Registro eliminado",
      "Error! Al eliminar el registro:");
  }

  /**
   *  🔰 Actualiza el stock y notifica si el stock es insuficiente o se ha agotado. 🔰
   */
  static updateStock(id, change) {
    return ExecuteManager.execute(() => {
        const purchases = this.getPurchases();
        const purchaseIndex = purchases.findIndex(p => p.id === id);
        if (purchaseIndex === -1) {
          NotificationManager.info("Compra no encontrada");
          throw new Error("Compra no encontrada");
        }

        const purchase = purchases[purchaseIndex];
        const nuevoStock = purchase.stock + change;

        if (nuevoStock < 0 || nuevoStock > purchase.cantidad) {
          NotificationManager.warning(`No se puede ${change > 0 ? 'aumentar' : 'disminuir'} más el stock`);
          return {success: false};
        }

        const updatedPurchase = {
          ...purchase,
          stock: nuevoStock,
          productosVendidos: purchase.cantidad - nuevoStock
        };

        if (nuevoStock === 0) {
          NotificationManager.warning(`¡Atención! Se han agotado el producto ${purchase.producto}`);
        }

        LocalStorageManager.update(this.KEY_PURCHASES, id, updatedPurchase);

        // ─────────────────────────────────────────────────────────────
        // SINCRONIZACIÓN CON GOOGLE SHEET (acción 'update')
        // ─────────────────────────────────────────────────────────────

        // 1) Calcula el índice de fila
        const rowIndex = purchaseIndex + 2;

        // 2) (Re)Calcula datos financieros básicos
        const total = updatedPurchase.precioProducto * updatedPurchase.cantidad;
        const gananciaUnitaria = 0; // Ajusta si deseas
        const ventasTotales = 0;
        const gananciaPorVentas = 0;

        const dataToSync = {
          fila: rowIndex,
          proveedor: updatedPurchase.proveedor,
          ciudad: updatedPurchase.ciudad,
          telefono: updatedPurchase.telefono,
          correo: updatedPurchase.correo,
          producto: updatedPurchase.producto,
          precio: updatedPurchase.precioProducto.toFixed(2),
          cantidad: updatedPurchase.cantidad,
          total: total.toFixed(2),
          gananciaUnitaria: gananciaUnitaria.toFixed(2),
          precioVentaPublico: updatedPurchase.precioVentaPublico.toFixed(2),
          stock: updatedPurchase.stock,
          productosVendidos: updatedPurchase.productosVendidos,
          ventasTotales: ventasTotales.toFixed(2),
          gananciaPorVentas: gananciaPorVentas.toFixed(2),
          autoriza: updatedPurchase.autorizador || "No especificado",
          fecha: updatedPurchase.fecha,
          hora: updatedPurchase.hora
        };

        // 3) Actualizamos la misma fila (acción 'update')
        syncWithGoogleSheet("update", dataToSync);

        return {
          success: true,
          updatedPurchase
        };
      },
      "Exito! Actualizando stock.",
      "Error! Al actualizar stock:");
  }
}

export {PurchaseService};
