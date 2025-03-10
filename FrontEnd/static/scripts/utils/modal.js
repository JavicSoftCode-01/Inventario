import { PurchaseManager } from "./searchFilters.js";
import { Compra } from "../../../../BackEnd/models/models.js";
import { ExecuteManager } from "../../../../BackEnd/utils/execute.js";

class ModalManager {
  // Propiedad estática.
  modals = {
    confirm: {
      container: document.getElementById("confirm-modal"),
      message: document.getElementById("confirm-modal-message"),
      confirmBtn: document.getElementById("confirm-modal-yes"),
      cancelBtn: document.getElementById("confirm-modal-no")
    },
    details: {
      container: document.getElementById("modal-detalles"),
      leftColumn: document.getElementById("detalles-col-left"),
      rightColumn: document.getElementById("detalles-col-right")
    }
  };

  // >>> Métodos utilizados solo dentro de esta clase. <<<

  // Calcula y devuelve los datos financieros de una compra.
  calculateFinancials(purchase) {
    return ExecuteManager.execute(() => {
      // Total: precioProducto * cantidad
      const total = Number(purchase.precioProducto) * Number(purchase.cantidad);
      // Ganancia unitaria: precioVentaPublico - precioProducto
      const gananciaUnitaria = Number(purchase.precioVentaPublico) - Number(purchase.precioProducto);
      // Se usa el valor almacenado en purchase.productosVendidos (o 0 si no existe)
      const productosVendidos = Number(purchase.productosVendidos) || 0;
      // Ventas Totales: productosVendidos * precioVentaPublico
      const ventasTotales = productosVendidos * Number(purchase.precioVentaPublico);
      // Ganancia por Ventas: productosVendidos * gananciaUnitaria
      const gananciaTotal = productosVendidos * gananciaUnitaria;
      
      return {
        total,
        profit: gananciaUnitaria,
        ventasTotales,
        gananciaTotal
      };
    }, "Exito! Al calcular los financieros.", "Error! Al calcular los financieros:");
  }

  // Genera el HTML para la columna izquierda del modal de detalles.
  generateLeftColumnHTML(purchase, rowNumber, financials) {
    return ExecuteManager.execute(() => `
      <p><strong>Fila:</strong> ${rowNumber}</p>
      <p><strong>Proveedor:</strong> ${purchase.proveedor || 'No especificado'}</p>
      <p><strong>Ciudad:</strong> ${purchase.ciudad || 'No especificada'}</p>
      <p><strong>Teléfono:</strong> ${purchase.telefono || 'No especificado'}</p>
      <p><strong>Correo:</strong> ${purchase.correo || 'No especificado'}</p>
      <p><strong>Producto:</strong> ${purchase.producto || 'No especificado'}</p>
      <p><strong>Precio:</strong> $ ${(Number(purchase.precioProducto) || 0).toFixed(2)}</p>
      <p><strong>Cantidad:</strong> ${purchase.cantidad || '0'}</p>
      <p><strong>Total:</strong> $ ${financials.total.toFixed(2)}</p>
    `, "Exito! Al generar HTML de columna izquierda.", "Error! Al generar HTML de columna izquierda:");
  }

  // Genera el HTML para la columna derecha del modal de detalles.
  generateRightColumnHTML(purchase, financials) {
    return ExecuteManager.execute(() => `
      <p><strong>Ganancia Unitaria:</strong> $ ${financials.profit.toFixed(2)}</p>
      <p><strong>Precio Venta Público:</strong> $ ${purchase.precioVentaPublico || '0.00'}</p>
      <p><strong>Stock Actual:</strong> ${purchase.stock || '0'}</p>
      <p><strong>Productos Vendidos:</strong> ${purchase.productosVendidos || '0'}</p>
      <p><strong>Ventas Totales:</strong> $ ${financials.ventasTotales.toFixed(2)}</p>
      <p><strong>Ganancia por Ventas:</strong> $ ${financials.gananciaTotal.toFixed(2)}</p>
      <p><strong>Autoriza:</strong> ${purchase.autorizador || 'No especificado'}</p>
      <p><strong>Fecha:</strong> ${purchase.fecha || 'No especificada'}</p>
      <p><strong>Hora:</strong> ${purchase.hora || 'No especificada'}</p>
    `, "Exito! Al generar HTML de columna derecha.", "Error! Al generar HTML de columna derecha:");
  }

  // Muestra un modal de confirmación con el mensaje proporcionado y maneja las acciones de confirmación y cancelación.
  showConfirmModal(message, onConfirm, onCancel) {
    return ExecuteManager.execute(() => {
      const { container, message: messageEl, confirmBtn, cancelBtn } = this.modals.confirm;
      if (!container || !messageEl) {
        throw new Error("Elementos del modal no encontrados");
      }
      messageEl.textContent = message;
      container.style.display = "flex";

      confirmBtn.onclick = () => {
        container.style.display = "none";
        onConfirm?.();
      };

      cancelBtn.onclick = () => {
        container.style.display = "none";
        onCancel?.();
      };
    }, "Exito! Al mostrar modal de confirmación.", "Error! Al mostrar modal de confirmación:");
  }

  // Muestra el modal de detalles con la información de la compra proporcionada.
  showDetailsModal(purchase, rowNumber) {
    return ExecuteManager.execute(() => {
      const { container, leftColumn, rightColumn } = this.modals.details;
      if (!container || !leftColumn || !rightColumn) {
        throw new Error("Elementos del modal de detalles no encontrados");
      }
      const financials = this.calculateFinancials(purchase);

      leftColumn.innerHTML = this.generateLeftColumnHTML(purchase, rowNumber, financials);
      rightColumn.innerHTML = this.generateRightColumnHTML(purchase, financials);
      container.style.display = "block";
    }, "Modal de detalles mostrado correctamente.", "Error al mostrar el modal de detalles:");
  }

  // Cierra el modal de detalles.
  closeDetailsModal() {
    return ExecuteManager.execute(() => {
      const { container } = this.modals.details;
      if (!container) throw new Error("Modal de detalles no encontrado");
      container.style.display = "none";
    }, "Modal de detalles cerrado correctamente.", "Error al cerrar el modal de detalles:");
  }

  // >>> Métodos estáticos utilizados en otros archivos. <<<

  /**
   * 🔰 Método para mostrar modal de confirmación. 🔰
   */
  static showConfirm(message, onConfirm, onCancel) {
    return new ModalManager().showConfirmModal(message, onConfirm, onCancel);
  }

  /**
   * 🔰 Método para mostrar modal de detalles. 🔰
   */
  static showDetails(purchase, rowNumber) {
    return new ModalManager().showDetailsModal(purchase, rowNumber);
  }

  /**
   * 🔰 Método para cerrar modal de detalles. 🔰
   */
  static closeDetails() {
    return new ModalManager().closeDetailsModal();
  }
}

export { ModalManager };
