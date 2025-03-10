import { Compra } from "../models/models.js";
import { LocalStorageManager } from "../database/localStorage.js";
import { DateTimeManager } from "../../FrontEnd/static/scripts/utils/datetime.js";
import { AuthManager } from "./authServices.js";
import { NotificationManager } from "../../FrontEnd/static/scripts/utils/showNotifications.js";
import { ExecuteManager } from "../utils/execute.js";
import { syncWithGoogleSheet } from "./syncGoogleSheet.js";

class PurchaseService {
  static KEY_PURCHASES = "compras";

  // Función auxiliar para calcular el stock (usada solo en actualizaciones normales)
  static calculateStock(cantidad, vendidos) {
    return cantidad - vendidos;
  }

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
   * Al crear, si se pasa el valor de `productosVendidos` (por ejemplo, en un registro nuevo por cambio de precio),
   * se usará para calcular el stock; pero en un registro "fresco" por cambio de precio se reinicia a 0,
   * de modo que stock = cantidad.
   * Además, se calcula la ganancia unitaria automáticamente.
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

      // Si se provee productosVendidos, se utiliza; de lo contrario, se inicia en 0.
      newPurchase.productosVendidos = data.productosVendidos !== undefined ? Number(data.productosVendidos) : 0;
      // Si se trata de un registro nuevo (por cambio de precio) queremos que:
      // stock = cantidad y productosVendidos = 0.
      newPurchase.stock = newPurchase.productosVendidos === 0 ? newPurchase.cantidad : PurchaseService.calculateStock(newPurchase.cantidad, newPurchase.productosVendidos);

      const result = LocalStorageManager.create(this.KEY_PURCHASES, newPurchase);
      if (result) {
        NotificationManager.success("¡Éxito! Compra creada");

        const purchases = this.getPurchases();
        const rowIndex = purchases.findIndex(p => p.id === newPurchase.id) + 2;
        const total = newPurchase.precioProducto * newPurchase.cantidad;
        // Calcula la ganancia unitaria de forma inmediata
        const gananciaUnitaria = newPurchase.precioVentaPublico - newPurchase.precioProducto;
        const ventasTotales = 0;
        const gananciaPorVentas = 0;

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
   * Si se detecta un cambio en el precio del producto o en el precio de venta al público,  
   * se crea un nuevo registro "fresco" reiniciando los campos contables para reflejar los nuevos valores.
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

      // Detecta si se ha modificado alguno de los precios
      const precioProductoCambiado = data.precioProducto && Number(data.precioProducto) !== purchase.precioProducto;
      const precioVentaPublicoCambiado = data.precioVentaPublico && Number(data.precioVentaPublico) !== purchase.precioVentaPublico;

      if (precioProductoCambiado || precioVentaPublicoCambiado) {
        // Se crea un nuevo registro, reiniciando los campos contables:
        const newPurchaseData = {
          proveedor: data.proveedor || purchase.proveedor,
          ciudad: data.ciudad || purchase.ciudad,
          telefono: data.telefono || purchase.telefono,
          correo: data.correo || purchase.correo,
          producto: data.producto || purchase.producto,
          precioProducto: Number(data.precioProducto) || purchase.precioProducto,
          cantidad: Number(data.cantidad) || purchase.cantidad,
          precioVentaPublico: Number(data.precioVentaPublico) || purchase.precioVentaPublico,
          // Se reinician los campos contables para reflejar un registro nuevo:
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

      // Actualización normal sin cambios de precios
      const currentSold = purchase.productosVendidos || 0;
      if (data.cantidad && Number(data.cantidad) < currentSold) {
        NotificationManager.error("La nueva cantidad no puede ser menor que los productos vendidos.");
        return false;
      }

      const newQuantity = data.cantidad ? Number(data.cantidad) : purchase.cantidad;
      const newStock = PurchaseService.calculateStock(newQuantity, currentSold);

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
          ventasTotales: updatedPurchase.ventasTotales ? updatedPurchase.ventasTotales.toFixed(2) : "0.00",
          gananciaPorVentas: updatedPurchase.gananciaPorVentas ? updatedPurchase.gananciaPorVentas.toFixed(2) : "0.00",
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
      if (purchase.stock === undefined || purchase.stock === null) {
        purchase.stock = purchase.cantidad;
      }

      const nuevoStock = purchase.stock + change;
      if (nuevoStock < 0 || nuevoStock > purchase.cantidad) {
        NotificationManager.warning(`No se puede ${change > 0 ? 'aumentar' : 'disminuir'} más el stock`);
        return { success: false };
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
