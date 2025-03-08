import {PurchaseManager} from "./searchFilters.js";
import {Compra} from "../../../../BackEnd/models/models.js";
import {ExecuteManager} from "../../../../BackEnd/utils/execute.js";

class ModalManager {
    constructor() {
        this.modals = {
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
    }

    showConfirmModal(message, onConfirm, onCancel) {
        return ExecuteManager.execute(() => {
            const {container, message: messageEl, confirmBtn, cancelBtn} = this.modals.confirm;

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
        }, "Modal de confirmación mostrado correctamente.", "Error al mostrar modal de confirmación:");
    }

    showDetailsModal(purchase, rowNumber) {
        return ExecuteManager.execute(() => {
            const {container, leftColumn, rightColumn} = this.modals.details;

            if (!container || !leftColumn || !rightColumn) {
            throw new Error("Elementos del modal de detalles no encontrados");
            }

            const financials = this.calculateFinancials(purchase);
            
            leftColumn.innerHTML = this.generateLeftColumnHTML(purchase, rowNumber, financials);
            rightColumn.innerHTML = this.generateRightColumnHTML(purchase, financials);
            
            container.style.display = "block";
        }, "Modal de detalles mostrado correctamente.", "Error al mostrar el modal de detalles:");
    }

    calculateFinancials(purchase) {
        return ExecuteManager.execute(() => {
            const compraInstance = new Compra(
                purchase.id,
                purchase.proveedor,
                purchase.ciudad,
                purchase.telefono,
                purchase.correo,
                purchase.producto,
                purchase.precioProducto,
                purchase.cantidad,
                purchase.precioVentaPublico,
                purchase.fecha,
                purchase.hora,
                purchase.nombreUsuario,
                purchase.autorizador
            );

            compraInstance.stock = purchase.stock;
            compraInstance.productosVendidos = purchase.cantidad - purchase.stock;

            return {
                total: PurchaseManager.calculateTotal(purchase),
                profit: Number(purchase.precioVentaPublico) - Number(purchase.precioProducto),
                ventasTotales: compraInstance.calcularVentasTotales(),
                gananciaTotal: compraInstance.calcularGananciaVentas()
            };
        }, "Cálculos financieros completados.", "Error al calcular los financieros:");
    }

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
        `, "HTML de la columna izquierda generado.", "Error al generar el HTML de la columna izquierda:");
    }

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
        `, "HTML de columna derecha generado correctamente.", "Error al generar el HTML de la columna derecha:");
    }

    closeDetailsModal() {
        return ExecuteManager.execute(() => {
            const {container} = this.modals.details;
            if (!container) throw new Error("Modal de detalles no encontrado");
            container.style.display = "none";
        }, "Modal de detalles cerrado correctamente.", "Error al cerrar el modal de detalles:");
    }
}

export const modalManager = new ModalManager();