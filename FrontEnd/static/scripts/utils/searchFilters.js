/**
 * Calcula el total de una compra.
 */
function calcularTotal(compra) {
    return (+compra.precioProducto || 0) * (+compra.cantidad || 0);
  }
  
  /**
   * Filtra un arreglo de compras por un query.
   */
  function filtrarComprasPorQuery(compras, query) {
    const q = query.toLowerCase();
    return compras.filter((compra) => {
      return (
        compra.proveedor.toLowerCase().includes(q) ||
        compra.autorizaCompra.toLowerCase().includes(q) ||
        compra.telefono.toLowerCase().includes(q)
      );
    });
  }
  
  /**
   * Filtra un arreglo de compras para obtener aquellas con el total máximo o mínimo.
   */
  function filtrarComprasPorTotal(compras, orden = "max") {
    if (!compras.length) return [];
    const totales = compras.map(calcularTotal);
    const valorFiltro =
      orden === "max" ? Math.max(...totales) : Math.min(...totales);
    return compras.filter((compra) => calcularTotal(compra) === valorFiltro);
  }
  
  export { calcularTotal, filtrarComprasPorQuery, filtrarComprasPorTotal };
  