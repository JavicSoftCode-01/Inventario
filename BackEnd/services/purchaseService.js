import { Compra } from "../models/models.js";
import { LocalStorageManager } from "../database/localStorage.js";
import { DateTimeManager } from "../../FrontEnd/static/scripts/utils/datetime.js";
import { AuthManager } from "./authServices.js";
import { NotificationManager } from "../../FrontEnd/static/scripts/utils/showNotifications.js";
import { ExecuteManager } from "../utils/execute.js";
import GoogleSheetSync from "./syncGoogleSheet.js";
import PurchaseCalculations from "./../utils/purchaseCalculations.js";

/**
 * Servicio para gestionar operaciones relacionadas con compras.
 */
class PurchaseService {
  static KEY_PURCHASES = "compras";
  static googleSheetSync = new GoogleSheetSync(
    'https://script.google.com/macros/s/AKfycbx5KnDachGl-tdx-1yeYj_HxUan8Ub-DIemrWI1mzHd8t27R1gEvie0LYwJGaYpPD2W/exec'
  );

  /**
   * Obtiene todas las compras almacenadas en el LocalStorage.
   * @returns {Array} - Array de compras
   */
  static getPurchases() {
    return ExecuteManager.execute(
      () => LocalStorageManager.getData(this.KEY_PURCHASES) || [],
      "Compras obtenidas exitosamente.",
      "Error al obtener las compras:"
    );
  }

  /**
   * Crea un nuevo registro de compra.
   * @param {Object} data - Datos de la compra
   * @returns {Object} - Resultado de la operación
   */
  static createPurchase(data) {
    return ExecuteManager.execute(() => {
      const session = this._validateSession();
      const { fecha, hora } = DateTimeManager.getDateTime();
      
      const newPurchase = this._createPurchaseObject(data, session, fecha, hora);
      
      const result = LocalStorageManager.create(this.KEY_PURCHASES, newPurchase);
      if (result) {
        NotificationManager.success("¡Éxito! Compra creada");
        
        const purchases = this.getPurchases();
        const rowIndex = PurchaseCalculations.calculateRowIndex(purchases, newPurchase.id);
        const dataToSync = PurchaseCalculations.prepareSyncData(newPurchase, rowIndex);
        
        this.googleSheetSync.sync("create", dataToSync);
        return true;
      } else {
        NotificationManager.error("¡Error! Al crear la compra");
        throw new Error("Error al crear la compra");
      }
    },
    "¡Éxito! Compra creada.",
    "¡Error! Al crear la compra:");
  }

  /**
   * Actualiza un registro de compra.
   * @param {number} id - ID de la compra
   * @param {Object} data - Datos actualizados
   * @returns {Object} - Resultado de la operación
   */
  static updatePurchase(id, data) {
    return ExecuteManager.execute(() => {
      const purchases = this.getPurchases();
      const purchase = this._findAndValidatePurchase(purchases, Number(id));
      
      // Detecta si se han modificado los precios
      if (this._hasPriceChanged(purchase, data)) {
        return this._handlePriceChange(purchase, data);
      }
      
      return this._performNormalUpdate(purchases, purchase, data);
    },
    "¡Éxito! Registro actualizado",
    "¡Error! Al actualizar el registro:");
  }

  /**
   * Elimina un registro de compra.
   * @param {number} id - ID de la compra
   * @returns {Object} - Resultado de la operación
   */
  static deletePurchase(id) {
    return ExecuteManager.execute(() => {
      const purchases = this.getPurchases();
      const purchase = this._findAndValidatePurchase(purchases, Number(id));
      
      const result = LocalStorageManager.delete(this.KEY_PURCHASES, Number(id));
      if (result) {
        NotificationManager.success("¡Éxito! Registro eliminado");
        const rowIndex = PurchaseCalculations.calculateRowIndex(purchases, Number(id));
        this.googleSheetSync.sync("delete", { fila: rowIndex });
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
   * Actualiza el stock de una compra.
   * @param {number} id - ID de la compra
   * @param {number} change - Cambio en el stock (positivo o negativo)
   * @returns {Object} - Resultado de la operación
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
      const result = this._processStockUpdate(purchase, change);
      
      if (!result.success) {
        return result;
      }
      
      LocalStorageManager.update(this.KEY_PURCHASES, id, result.updatedPurchase);
      
      const rowIndex = PurchaseCalculations.calculateRowIndex(purchases, id);
      const dataToSync = PurchaseCalculations.prepareSyncData(result.updatedPurchase, rowIndex);
      
      this.googleSheetSync.sync("update", dataToSync);
      
      return result;
    },
    "¡Éxito! Actualizando stock.",
    "¡Error! Al actualizar stock:");
  }

  /**
   * Obtiene una compra por su ID.
   * @param {number} id - ID de la compra
   * @returns {Object} - Compra encontrada o null
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

  // Métodos privados auxiliares
  
  /**
   * Valida que exista una sesión activa.
   * @returns {Object} - Datos de la sesión
   * @private
   */
  static _validateSession() {
    const session = AuthManager.getCurrentSession();
    if (!session) {
      NotificationManager.info("No hay sesión activa");
      throw new Error("No hay sesión activa");
    }
    return session;
  }

  /**
   * Crea un objeto de compra con los datos proporcionados.
   * @param {Object} data - Datos de entrada
   * @param {Object} session - Datos de la sesión
   * @param {string} fecha - Fecha actual
   * @param {string} hora - Hora actual
   * @returns {Object} - Objeto Compra creado
   * @private
   */
  static _createPurchaseObject(data, session, fecha, hora) {
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
    
    // Inicializar datos contables
    newPurchase.productosVendidos = data.productosVendidos !== undefined ? Number(data.productosVendidos) : 0;
    newPurchase.stock = newPurchase.cantidad;
    
    return newPurchase;
  }

  /**
   * Busca y valida una compra.
   * @param {Array} purchases - Lista de compras
   * @param {number} id - ID de la compra
   * @returns {Object} - Compra encontrada
   * @private
   */
  static _findAndValidatePurchase(purchases, id) {
    const purchase = purchases.find(p => p.id === id);
    
    if (!purchase) {
      NotificationManager.info("Registro no encontrado");
      throw new Error("Registro no encontrado");
    }
    
    const session = AuthManager.getCurrentSession();
    if (!session || session.nombreUsuario !== purchase.nombreUsuario) {
      NotificationManager.info("No tienes permisos para modificar este registro");
      throw new Error("No tienes permisos para modificar este registro");
    }
    
    return purchase;
  }

  /**
   * Verifica si los precios han cambiado.
   * @param {Object} purchase - Compra original
   * @param {Object} data - Nuevos datos
   * @returns {boolean} - True si han cambiado los precios
   * @private
   */
  static _hasPriceChanged(purchase, data) {
    const precioProductoCambiado = data.precioProducto && Number(data.precioProducto) !== purchase.precioProducto;
    const precioVentaPublicoCambiado = data.precioVentaPublico && Number(data.precioVentaPublico) !== purchase.precioVentaPublico;
    
    return precioProductoCambiado || precioVentaPublicoCambiado;
  }

  /**
   * Maneja el cambio de precios creando un nuevo registro.
   * @param {Object} purchase - Compra original
   * @param {Object} data - Nuevos datos
   * @returns {boolean} - Resultado de la operación
   * @private
   */
  static _handlePriceChange(purchase, data) {
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

  /**
   * Realiza una actualización normal de la compra.
   * @param {Array} purchases - Lista de compras
   * @param {Object} purchase - Compra original
   * @param {Object} data - Nuevos datos
   * @returns {boolean} - Resultado de la operación
   * @private
   */
  static _performNormalUpdate(purchases, purchase, data) {
    const currentSold = purchase.productosVendidos || 0;
    const newQuantity = data.cantidad ? Number(data.cantidad) : purchase.cantidad;
    
    if (!PurchaseCalculations.isValidQuantityUpdate(newQuantity, currentSold)) {
      NotificationManager.error("La nueva cantidad no puede ser menor que los productos vendidos.");
      return false;
    }
    
    const newStock = data.cantidad ? newQuantity : purchase.stock;
    
    const updatedPurchase = {
      ...purchase,
      ...data,
      id: Number(purchase.id),
      cantidad: newQuantity,
      stock: newStock,
      productosVendidos: currentSold,
      precioProducto: purchase.precioProducto,
      precioVentaPublico: purchase.precioVentaPublico,
      nombreUsuario: purchase.nombreUsuario,
      autorizador: purchase.autorizador
    };
    
    const result = LocalStorageManager.update(this.KEY_PURCHASES, Number(purchase.id), updatedPurchase);
    
    if (result) {
      NotificationManager.success("¡Éxito! Registro actualizado");
      
      const rowIndex = PurchaseCalculations.calculateRowIndex(purchases, Number(purchase.id));
      const dataToSync = PurchaseCalculations.prepareSyncData(updatedPurchase, rowIndex);
      
      this.googleSheetSync.sync("update", dataToSync);
      return true;
    } else {
      NotificationManager.error("¡Error! Al actualizar el registro");
      return false;
    }
  }

  /**
   * Procesa la actualización de stock.
   * @param {Object} purchase - Compra a actualizar
   * @param {number} change - Cambio en el stock
   * @returns {Object} - Resultado de la operación
   * @private
   */
  static _processStockUpdate(purchase, change) {
    // Si el stock no está definido, lo igualamos a la cantidad
    if (purchase.stock === undefined || purchase.stock === null) {
      purchase.stock = purchase.cantidad;
    }
    
    const nuevoStock = purchase.stock + change;
    
    if (nuevoStock < 0 || nuevoStock > purchase.cantidad) {
      NotificationManager.warning(`No se puede ${change > 0 ? 'aumentar' : 'disminuir'} más el stock`);
      return { success: false };
    }
    
    // Actualizamos productosVendidos
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
    
    return {
      success: true,
      updatedPurchase
    };
  }
}

export { PurchaseService };