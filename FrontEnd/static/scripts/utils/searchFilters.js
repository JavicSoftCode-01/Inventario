///**
// * Calcula el total de una compra.
// */
//function calcularTotal(compra) {
//    return (+compra.precioProducto || 0) * (+compra.cantidad || 0);
//  }
//
//  /**
//   * Filtra un arreglo de compras por un query.
//   */
//  function filtrarComprasPorQuery(compras, query) {
//    const q = query.toLowerCase();
//    return compras.filter((compra) => {
//      return (
//        compra.proveedor.toLowerCase().includes(q) ||
//        compra.autorizador.toLowerCase().includes(q) ||
//        compra.telefono.toLowerCase().includes(q)
//      );
//    });
//  }
//
//  /**
//   * Filtra un arreglo de compras para obtener aquellas con el total máximo o mínimo.
//   */
//  function filtrarComprasPorTotal(compras, orden = "max") {
//    if (!compras.length) return [];
//    const totales = compras.map(calcularTotal);
//    const valorFiltro =
//      orden === "max" ? Math.max(...totales) : Math.min(...totales);
//    return compras.filter((compra) => calcularTotal(compra) === valorFiltro);
//  }
//
//  export { calcularTotal, filtrarComprasPorQuery, filtrarComprasPorTotal };
//
// PurchaseManager.js

/**
 * Clase PurchaseManager para gestionar operaciones relacionadas con compras.
 */
class PurchaseManager {
  /**
   * Calcula el total de una compra.
   * @param {Object} purchase - Objeto que representa una compra.
   * @returns {number} - Total calculado de la compra.
   */
  static calculateTotal(purchase) {
    try {
      // Convertir precio y cantidad a número, utilizando 0 si no son válidos.
      const price = Number(purchase.precioProducto) || 0;
      const quantity = Number(purchase.cantidad) || 0;
      return price * quantity;
    } catch (error) {
      console.error("Error al calcular el total de la compra:", error.message);
      return 0;
    }
  }

  /**
   * Filtra un arreglo de compras utilizando un query de búsqueda.
   * @param {Array} purchases - Arreglo de objetos de compra.
   * @param {string} query - Texto de búsqueda.
   * @returns {Array} - Arreglo de compras filtradas.
   */
  static filterPurchasesByQuery(purchases, query) {
    try {
      if (!Array.isArray(purchases)) {
        throw new Error("El primer parámetro debe ser un arreglo de compras.");
      }
      const lowerQuery = query.toLowerCase();
      return purchases.filter(purchase => {
        // Uso del operador de encadenamiento opcional para evitar errores si las propiedades no existen.
        return (
          purchase.proveedor?.toLowerCase().includes(lowerQuery) ||
          purchase.autorizador?.toLowerCase().includes(lowerQuery) ||
          purchase.telefono?.toLowerCase().includes(lowerQuery)
        );
      });
    } catch (error) {
      console.error("Error al filtrar compras por query:", error.message);
      return [];
    }
  }

  /**
   * Filtra un arreglo de compras para obtener aquellas con el total máximo o mínimo.
   * @param {Array} purchases - Arreglo de objetos de compra.
   * @param {string} [order="max"] - Tipo de orden: "max" para el total máximo, "min" para el total mínimo.
   * @returns {Array} - Arreglo de compras con el total filtrado.
   */
  static filterPurchasesByTotal(purchases, order = "max") {
    try {
      if (!Array.isArray(purchases) || purchases.length === 0) {
        return [];
      }
      // Calcula los totales para cada compra.
      const totals = purchases.map(purchase => PurchaseManager.calculateTotal(purchase));
      // Determina el valor a filtrar según el orden indicado.
      const filterValue = order === "max" ? Math.max(...totals) : Math.min(...totals);
      return purchases.filter(purchase => PurchaseManager.calculateTotal(purchase) === filterValue);
    } catch (error) {
      console.error("Error al filtrar compras por total:", error.message);
      return [];
    }
  }
}

// Exporta la clase para ser utilizada en otros módulos
export { PurchaseManager };
