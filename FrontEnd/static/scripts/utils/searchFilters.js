import {ExecuteManager} from "../../../../BackEnd/utils/execute.js";
import {NotificationManager} from "./showNotifications.js";

class PurchaseManager {

  // Propiedad estaticada de los Campos de búsqueda predeterminados para la aplicación.
  static searchFields = ['proveedor', 'autorizador', 'telefono', 'producto', 'ciudad'];

  // >>> Métodos estáticos utilizados en otros archivos. <<<

  /**
   * 🔰 Método para calcular el total de una compra. 🔰
   */
  static calculateTotal(purchase) {
    return ExecuteManager.execute(() => {
      const price = Number(purchase.precioProducto) || 0;
      const quantity = Number(purchase.cantidad) || 0;
      return price * quantity;
    }, "Exito! Al calcular el total.", "Error! Al calcular el total:");
  }

  /**
   * 🔰 Método para buscar en los registros según términos y campos específicos. 🔰
   */
  static search(data, searchTerm, searchFields = this.searchFields, options = {matchType: 'includes'}) {
    return ExecuteManager.execute(() => {
      if (!Array.isArray(data) || data.length === 0) {
        NotificationManager.info("No hay datos disponibles para buscar");
        return [];
      }

      if (!searchTerm?.trim()) {
        return data;
      }

      const {matchType} = options;
      const lowerSearchTerm = searchTerm.toString().toLowerCase();

      return data.filter(item => searchFields.some(field => {
        const fieldValue = item[field]?.toString().toLowerCase();
        if (!fieldValue) return false;

        return matchType === 'exact' ? fieldValue === lowerSearchTerm : fieldValue.includes(lowerSearchTerm);
      }));
    }, "Exito! Al realizar la búsqueda.", "Error! Al realizar la búsqueda:");
  }

  /**
   * 🔰 Método para filtrar compras por total máximo o mínimo. 🔰
   */
  static filterPurchasesByTotal(purchases, order = "max") {
    return ExecuteManager.execute(() => {
      if (!Array.isArray(purchases) || purchases.length === 0) {
        NotificationManager.info("No hay compras para filtrar");
        return [];
      }

      const totals = purchases.map(purchase => this.calculateTotal(purchase));
      const filterValue = order === "max" ? Math.max(...totals) : Math.min(...totals);

      return purchases.filter(purchase => this.calculateTotal(purchase) === filterValue);
    }, "Exito! Al filtrar por total.", "Error! Al filtrar por total:");
  }
}

export {PurchaseManager};