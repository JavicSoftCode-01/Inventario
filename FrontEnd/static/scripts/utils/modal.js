//import {calcularTotal} from "./searchFilters.js";
//
///**
// * Muestra un modal de confirmación personalizado.
// */
//function showConfirmModal(message, onConfirm, onCancel) {
//    const modal = document.getElementById("confirm-modal");
//    const messageEl = document.getElementById("confirm-modal-message");
//    const yesBtn = document.getElementById("confirm-modal-yes");
//    const noBtn = document.getElementById("confirm-modal-no");
//
//    messageEl.textContent = message;
//    modal.style.display = "flex";
//
//    yesBtn.onclick = function () {
//        modal.style.display = "none";
//        if (typeof onConfirm === "function") onConfirm();
//    };
//
//    noBtn.onclick = function () {
//        modal.style.display = "none";
//        if (typeof onCancel === "function") onCancel();
//    };
//}
//
///**
// * Muestra el modal de detalles de una compra.
// */
//function showDetallesModal(compra, filaNumero) {
//    const modal = document.getElementById("modal-detalles");
//    const colLeft = document.getElementById("detalles-col-left");
//    const colRight = document.getElementById("detalles-col-right");
//
//    const total = calcularTotal(compra).toFixed(2);
//    const ganancia = ((+compra.precioVentaPublico || 0) - (+compra.precioProducto || 0)).toFixed(2);
//
//    colLeft.innerHTML = `
//    <p><strong>Fila:</strong> ${filaNumero}</p>
//    <p><strong>Proveedor:</strong> ${compra.proveedor}</p>
//    <p><strong>Ciudad:</strong> ${compra.ciudad}</p>
//    <p><strong>Teléfono:</strong> ${compra.telefono}</p>
//    <p><strong>Correo:</strong> ${compra.correo}</p>
//    <p><strong>Producto:</strong> ${compra.producto}</p>
//     <p><strong>Precio:</strong> $ ${(+compra.precioProducto).toFixed(2)}</p>
//  `;
//
//    colRight.innerHTML = `
//    <p><strong>Cantidad:</strong> ${compra.cantidad}</p>
//    <p><strong>Total:</strong> $ ${total}</p>
//    <p><strong>Precio Venta Público:</strong> $ ${compra.precioVentaPublico}</p>
//    <p><strong>Autoriza:</strong> ${compra.autorizador}</p>
//    <p><strong>Fecha:</strong> ${compra.fecha}</p>
//    <p><strong>Hora:</strong> ${compra.hora}</p>
//    <p><strong>Ganancia:</strong> $ ${ganancia}</p>
//  `;
//
//    modal.style.display = "block";
//}
//
//
///**
// * Cierra el modal de detalles.
// */
//function cerrarDetallesModal() {
//    const modal = document.getElementById("modal-detalles");
//    if (modal) modal.style.display = "none";
//}
//
//export {showConfirmModal, showDetallesModal, cerrarDetallesModal};
//

import { PurchaseManager } from "./searchFilters.js";

/**
 * Clase para manejar los modales de la aplicación
 */
class ModalManager {
  constructor() {
    // Elementos del modal de confirmación
    this.confirmModal = document.getElementById("confirm-modal");
    this.confirmMessage = document.getElementById("confirm-modal-message");
    this.confirmYesBtn = document.getElementById("confirm-modal-yes");
    this.confirmNoBtn = document.getElementById("confirm-modal-no");

    // Elementos del modal de detalles
    this.detailsModal = document.getElementById("modal-detalles");
    this.leftColumn = document.getElementById("detalles-col-left");
    this.rightColumn = document.getElementById("detalles-col-right");
  }

  /**
   * Muestra un modal de confirmación
   * @param {string} message - Mensaje a mostrar
   * @param {Function} onConfirm - Callback para confirmación
   * @param {Function} onCancel - Callback para cancelación
   */
  showConfirmModal(message, onConfirm, onCancel) {
    try {
      if (!this.confirmModal || !this.confirmMessage) {
        throw new Error("Elementos del modal de confirmación no encontrados");
      }

      this.confirmMessage.textContent = message;
      this.confirmModal.style.display = "flex";

      // Configurar eventos de botones
      this.confirmYesBtn.onclick = () => {
        this.confirmModal.style.display = "none";
        if (typeof onConfirm === "function") onConfirm();
      };

      this.confirmNoBtn.onclick = () => {
        this.confirmModal.style.display = "none";
        if (typeof onCancel === "function") onCancel();
      };
    } catch (error) {
      console.error("Error al mostrar modal de confirmación:", error);
    }
  }

  /**
   * Muestra el modal de detalles de una compra
   * @param {Object} purchase - Objeto con datos de la compra
   * @param {number} rowNumber - Número de fila
   */
  showDetailsModal(purchase, rowNumber) {
    try {
      if (!this.detailsModal || !this.leftColumn || !this.rightColumn) {
        throw new Error("Elementos del modal de detalles no encontrados");
      }

      const total = PurchaseManager.calculateTotal(purchase).toFixed(2);
      const profit = (
        (Number(purchase.precioVentaPublico) || 0) - 
        (Number(purchase.precioProducto) || 0)
      ).toFixed(2);

      // Renderizar columna izquierda
      this.leftColumn.innerHTML = this.generateLeftColumnHTML(purchase, rowNumber);
      
      // Renderizar columna derecha
      this.rightColumn.innerHTML = this.generateRightColumnHTML(purchase, total, profit);

      this.detailsModal.style.display = "block";
    } catch (error) {
      console.error("Error al mostrar modal de detalles:", error);
    }
  }

  /**
   * Genera el HTML para la columna izquierda del modal
   * @private
   */
  generateLeftColumnHTML(purchase, rowNumber) {
    return `
      <p><strong>Fila:</strong> ${rowNumber}</p>
      <p><strong>Proveedor:</strong> ${purchase.proveedor || 'No especificado'}</p>
      <p><strong>Ciudad:</strong> ${purchase.ciudad || 'No especificada'}</p>
      <p><strong>Teléfono:</strong> ${purchase.telefono || 'No especificado'}</p>
      <p><strong>Correo:</strong> ${purchase.correo || 'No especificado'}</p>
      <p><strong>Producto:</strong> ${purchase.producto || 'No especificado'}</p>
      <p><strong>Precio:</strong> $ ${(Number(purchase.precioProducto) || 0).toFixed(2)}</p>
    `;
  }

  /**
   * Genera el HTML para la columna derecha del modal
   * @private
   */
  generateRightColumnHTML(purchase, total, profit) {
    return `
      <p><strong>Cantidad:</strong> ${purchase.cantidad || '0'}</p>
      <p><strong>Total:</strong> $ ${total}</p>
      <p><strong>Precio Venta Público:</strong> $ ${purchase.precioVentaPublico || '0.00'}</p>
      <p><strong>Autoriza:</strong> ${purchase.autorizador || 'No especificado'}</p>
      <p><strong>Fecha:</strong> ${purchase.fecha || 'No especificada'}</p>
      <p><strong>Hora:</strong> ${purchase.hora || 'No especificada'}</p>
      <p><strong>Ganancia:</strong> $ ${profit}</p>
    `;
  }

  /**
   * Cierra el modal de detalles
   */
  closeDetailsModal() {
    try {
      if (this.detailsModal) {
        this.detailsModal.style.display = "none";
      }
    } catch (error) {
      console.error("Error al cerrar modal de detalles:", error);
    }
  }
}

// Exportar una instancia única del ModalManager
export const modalManager = new ModalManager();