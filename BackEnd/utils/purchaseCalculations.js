/**
 * Clase utilitaria para realizar cálculos relacionados con compras.
 */
class PurchaseCalculations {
    /**
     * Calcula los valores financieros para una compra.
     * @param {Object} purchase - Objeto de compra
     * @returns {Object} - Objeto con los cálculos financieros
     */
    static calculateFinancials(purchase) {
      const total = purchase.precioProducto * purchase.cantidad;
      const gananciaUnitaria = purchase.precioVentaPublico - purchase.precioProducto;
      const ventasTotales = purchase.productosVendidos * purchase.precioVentaPublico;
      const gananciaPorVentas = purchase.productosVendidos * gananciaUnitaria;
  
      return {
        total,
        gananciaUnitaria,
        ventasTotales,
        gananciaPorVentas
      };
    }
  
    /**
     * Prepara los datos para sincronizar con Google Sheets.
     * @param {Object} purchase - Objeto de compra
     * @param {number} rowIndex - Índice de fila en la hoja de cálculo
     * @returns {Object} - Datos formateados para sincronización
     */
    static prepareSyncData(purchase, rowIndex) {
      const { total, gananciaUnitaria, ventasTotales, gananciaPorVentas } = this.calculateFinancials(purchase);
  
      return {
        fila: rowIndex,
        proveedor: purchase.proveedor,
        ciudad: purchase.ciudad,
        telefono: purchase.telefono,
        correo: purchase.correo,
        producto: purchase.producto,
        precio: purchase.precioProducto.toFixed(2),
        cantidad: purchase.cantidad,
        total: total.toFixed(2),
        gananciaUnitaria: gananciaUnitaria.toFixed(2),
        precioVentaPublico: purchase.precioVentaPublico.toFixed(2),
        stock: purchase.stock,
        productosVendidos: purchase.productosVendidos,
        ventasTotales: ventasTotales.toFixed(2),
        gananciaPorVentas: gananciaPorVentas.toFixed(2),
        autoriza: purchase.autorizador || "No especificado",
        fecha: purchase.fecha,
        hora: purchase.hora
      };
    }
  
    /**
     * Calcula el índice de fila para una compra en la hoja de cálculo.
     * @param {Array} purchases - Array de todas las compras
     * @param {number} purchaseId - ID de la compra
     * @returns {number} - Índice de la fila
     */
    static calculateRowIndex(purchases, purchaseId) {
      return purchases.findIndex(p => p.id === purchaseId) + 2; // +2 por la fila de encabezado y el índice base 0
    }
  
    /**
     * Valida si una actualización de cantidad es válida.
     * @param {number} newQuantity - Nueva cantidad
     * @param {number} soldProducts - Productos vendidos
     * @returns {boolean} - True si la actualización es válida
     */
    static isValidQuantityUpdate(newQuantity, soldProducts) {
      return newQuantity >= soldProducts;
    }
  }
  
  export default PurchaseCalculations;