import { Compra } from "../models/models.js";
import { LocalStorageManager } from "../database/localStorage.js";
import { DateTimeManager } from "../../FrontEnd/static/scripts/utils/datetime.js";
import { AuthManager } from "./authServices.js";
import { NotificationManager } from "../../FrontEnd/static/scripts/utils/showNotifications.js";
import { ExecuteManager } from "../utils/execute.js";
import { syncWithGoogleSheet } from "./syncGoogleSheet.js";

class PurchaseService {
  static KEY_PURCHASES = "compras";

  /**
   * Obtiene todas las compras almacenadas en el LocalStorage.
   */
  static getPurchases() {
    return ExecuteManager.execute(
      () => LocalStorageManager.getData(this.KEY_PURCHASES) || [],
      "Compras obtenidas exitosamente.",
      "Error al obtener las compras:"
    );
  }

  /**
   * Crea un nuevo registro.
   * En un registro nuevo (ya sea por creación o por cambio de precios) se reinician los campos contables:
   * - stock se fija igual a la cantidad
   * - productosVendidos se inicializa (generalmente en 0)
   * - se calcula la ganancia unitaria de inmediato.
   */
  static createPurchase(data) {
    return ExecuteManager.execute(() => {
      const session = AuthManager.getCurrentSession();
      if (!session) {
        NotificationManager.info("No hay sesión activa");
        throw new Error("No hay sesión activa");
      }
      const { fecha, hora } = DateTimeManager.getDateTime();
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
      // Para un registro nuevo, se reinician los datos contables:
      newPurchase.productosVendidos = data.productosVendidos !== undefined ? Number(data.productosVendidos) : 0;
      // El stock se fija igual a la cantidad total
      newPurchase.stock = newPurchase.cantidad;
      
      const result = LocalStorageManager.create(this.KEY_PURCHASES, newPurchase);
      if (result) {
        NotificationManager.success("¡Éxito! Compra creada");
        const purchases = this.getPurchases();
        const rowIndex = purchases.findIndex(p => p.id === newPurchase.id) + 2;
        const total = newPurchase.precioProducto * newPurchase.cantidad;
        const gananciaUnitaria = newPurchase.precioVentaPublico - newPurchase.precioProducto;
        const ventasTotales = newPurchase.productosVendidos * newPurchase.precioVentaPublico;
        const gananciaPorVentas = newPurchase.productosVendidos * gananciaUnitaria;
  
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
          stock: newPurchase.stock,
          productosVendidos: newPurchase.productosVendidos,
          ventasTotales: ventasTotales.toFixed(2),
          gananciaPorVentas: gananciaPorVentas.toFixed(2),
          autoriza: newPurchase.autorizador || "No especificado",
          fecha: newPurchase.fecha,
          hora: newPurchase.hora
        };
  
        syncWithGoogleSheet("create", dataToSync);
      } else {
        NotificationManager.error("¡Error! Al crear la compra");
        throw new Error("Error al crear la compra");
      }
    },
    "¡Éxito! Compra creada.",
    "¡Error! Al crear la compra:");
  }

  /**
   * Actualiza un registro si el usuario tiene permisos.
   * Si se detecta un cambio en el precio (del producto o venta), se crea un nuevo registro (con campos contables reiniciados).
   * En una actualización normal, si se modifica la cantidad mediante el formulario, se fija:
   * - cantidad = nueva cantidad
   * - stock = nueva cantidad (sin modificar productosVendidos)
   * Los otros campos contables (productosVendidos, ventasTotales y gananciaPorVentas) se mantienen.
   */
  static updatePurchase(id, data) {
    return ExecuteManager.execute(() => {
      const purchases = this.getPurchases();
      const purchase = purchases.find(p => p.id === Number(id));
      if (!purchase) {
        NotificationManager.info("Registro no encontrado");
        return false;
      }
      const session = AuthManager.getCurrentSession();
      if (!session || session.nombreUsuario !== purchase.nombreUsuario) {
        NotificationManager.info("No tienes permisos para actualizar este registro");
        return false;
      }
  
      // Detecta si se han modificado los precios
      const precioProductoCambiado = data.precioProducto && Number(data.precioProducto) !== purchase.precioProducto;
      const precioVentaPublicoCambiado = data.precioVentaPublico && Number(data.precioVentaPublico) !== purchase.precioVentaPublico;
  
      if (precioProductoCambiado || precioVentaPublicoCambiado) {
        // Se crea un nuevo registro (con reinicio de campos contables)
        const newPurchaseData = {
          proveedor: data.proveedor || purchase.proveedor,
          ciudad: data.ciudad || purchase.ciudad,
          telefono: data.telefono || purchase.telefono,
          correo: data.correo || purchase.correo,
          producto: data.producto || purchase.producto,
          precioProducto: Number(data.precioProducto) || purchase.precioProducto,
          cantidad: Number(data.cantidad) || purchase.cantidad,
          precioVentaPublico: Number(data.precioVentaPublico) || purchase.precioVentaPublico,
          productosVendidos: 0
        };
  
        const createResult = this.createPurchase(newPurchaseData);
        if (createResult) {
          NotificationManager.success("¡Se ha creado un nuevo registro debido al cambio de precios!");
          return true;
        } else {
          NotificationManager.error("Error al crear nuevo registro");
          return false;
        }
      }
  
      // Actualización normal: si se actualiza la cantidad, el stock se fija igual a la nueva cantidad
      const currentSold = purchase.productosVendidos || 0;
      const newQuantity = data.cantidad ? Number(data.cantidad) : purchase.cantidad;
      if (newQuantity < currentSold) {
        NotificationManager.error("La nueva cantidad no puede ser menor que los productos vendidos.");
        return false;
      }
      // El stock se actualizará igual a la nueva cantidad (los productos vendidos se mantienen)
      const newStock = data.cantidad ? newQuantity : purchase.stock;
  
      const updatedPurchase = {
        ...purchase,
        ...data,
        id: Number(id),
        cantidad: newQuantity,
        stock: newStock,
        productosVendidos: currentSold,
        // Se mantienen los precios originales en una actualización normal
        precioProducto: purchase.precioProducto,
        precioVentaPublico: purchase.precioVentaPublico,
        nombreUsuario: purchase.nombreUsuario,
        autorizador: purchase.autorizador
      };
  
      const result = LocalStorageManager.update(this.KEY_PURCHASES, Number(id), updatedPurchase);
      if (result) {
        NotificationManager.success("¡Éxito! Registro actualizado");
        const rowIndex = purchases.findIndex(p => p.id === Number(id)) + 2;
        const total = updatedPurchase.precioProducto * updatedPurchase.cantidad;
        const gananciaUnitaria = updatedPurchase.precioVentaPublico - updatedPurchase.precioProducto;
        const ventasTotales = updatedPurchase.productosVendidos * updatedPurchase.precioVentaPublico;
        const gananciaPorVentas = updatedPurchase.productosVendidos * gananciaUnitaria;
  
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
  
        syncWithGoogleSheet("update", dataToSync);
        return true;
      } else {
        NotificationManager.error("¡Error! Al actualizar el registro");
        return false;
      }
    },
    "¡Éxito! Registro actualizado",
    "¡Error! Al actualizar el registro:");
  }
  
  /**
   * Elimina un registro si el usuario tiene permisos.
   */
  static deletePurchase(id) {
    return ExecuteManager.execute(() => {
      const purchases = this.getPurchases();
      const purchase = purchases.find(p => p.id === Number(id));
      if (!purchase) {
        NotificationManager.info("Registro no encontrado");
        return false;
      }
      const session = AuthManager.getCurrentSession();
      if (!session || session.nombreUsuario !== purchase.nombreUsuario) {
        NotificationManager.info("No tienes permisos para eliminar este registro");
        return false;
      }
      const result = LocalStorageManager.delete(this.KEY_PURCHASES, Number(id));
      if (result) {
        NotificationManager.success("¡Éxito! Registro eliminado");
        const rowIndex = purchases.findIndex(p => p.id === Number(id)) + 2;
        syncWithGoogleSheet("delete", { fila: rowIndex });
        return true;
      } else {
        NotificationManager.error("¡Error! Al eliminar el registro");
        return false;
      }
    },
    "¡Éxito! Registro eliminado",
    "¡Error! Al eliminar el registro:");
  }
  
  /**
   * Actualiza el stock y notifica si el stock es insuficiente o se ha agotado.
   * Al vender (change negativo) se suma la cantidad vendida al campo de productosVendidos.
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
      // Si el stock no está definido, lo igualamos a la cantidad
      if (purchase.stock === undefined || purchase.stock === null) {
        purchase.stock = purchase.cantidad;
      }
      const nuevoStock = purchase.stock + change;
      if (nuevoStock < 0 || nuevoStock > purchase.cantidad) {
        NotificationManager.warning(`No se puede ${change > 0 ? 'aumentar' : 'disminuir'} más el stock`);
        return { success: false };
      }
  
      // Actualizamos productosVendidos:
      // Si se vende (change negativo), se incrementa el valor de productosVendidos.
      // Si se devuelve (change positivo), se decrementa el valor de productosVendidos, sin bajar de 0.
      let newProductosVendidos = Number(purchase.productosVendidos) || 0;
      if (change < 0) {
        newProductosVendidos += Math.abs(change);
      } else if (change > 0) {
        newProductosVendidos = Math.max(0, newProductosVendidos - change);
      }
  
      const updatedPurchase = {
        ...purchase,
        stock: nuevoStock,
        productosVendidos: newProductosVendidos
      };
  
      if (nuevoStock === 0) {
        NotificationManager.warning(`¡Atención! Se han agotado el producto ${purchase.producto}`);
      }
  
      LocalStorageManager.update(this.KEY_PURCHASES, id, updatedPurchase);
  
      const rowIndex = purchaseIndex + 2;
      const total = updatedPurchase.precioProducto * updatedPurchase.cantidad;
      const gananciaUnitaria = updatedPurchase.precioVentaPublico - updatedPurchase.precioProducto;
      const ventasTotales = updatedPurchase.productosVendidos * updatedPurchase.precioVentaPublico;
      const gananciaPorVentas = updatedPurchase.productosVendidos * gananciaUnitaria;
  
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
  
      syncWithGoogleSheet("update", dataToSync);
  
      return {
        success: true,
        updatedPurchase
      };
    },
    "¡Éxito! Actualizando stock.",
    "¡Error! Al actualizar stock:");
  }
  
  /**
   * Obtiene un registro específico por ID.
   */
  static getPurchaseById(id) {
    return ExecuteManager.execute(
      () => {
        const purchases = this.getPurchases();
        const purchase = purchases.find(p => p.id === Number(id));
        if (!purchase) {
          NotificationManager.info("Registro no encontrado");
          return null;
        }
        return purchase;
      },
      "Registro obtenido exitosamente.",
      "Error al obtener el registro:"
    );
  }  
}
  
export { PurchaseService };
