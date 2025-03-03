import {calcularTotal} from "./searchFilters.js"; // Ajusta la ruta según tu estructura

/**
 * Muestra un modal de confirmación personalizado.
 */
function showConfirmModal(message, onConfirm, onCancel) {
    const modal = document.getElementById("confirm-modal");
    const messageEl = document.getElementById("confirm-modal-message");
    const yesBtn = document.getElementById("confirm-modal-yes");
    const noBtn = document.getElementById("confirm-modal-no");

    messageEl.textContent = message;
    modal.style.display = "flex";

    yesBtn.onclick = function () {
        modal.style.display = "none";
        if (typeof onConfirm === "function") onConfirm();
    };

    noBtn.onclick = function () {
        modal.style.display = "none";
        if (typeof onCancel === "function") onCancel();
    };
}

/**
 * Muestra el modal de detalles de una compra.
 */
function showDetallesModal(compra, filaNumero) {
    const modal = document.getElementById("modal-detalles");
    const colLeft = document.getElementById("detalles-col-left");
    const colRight = document.getElementById("detalles-col-right");

    const total = calcularTotal(compra).toFixed(2);
    const ganancia = ((+compra.precioVentaPublico || 0) - (+compra.precioProducto || 0)).toFixed(2);

    colLeft.innerHTML = `
    <p><strong>Fila:</strong> ${filaNumero}</p>
    <p><strong>Proveedor:</strong> ${compra.proveedor}</p>
    <p><strong>Ciudad:</strong> ${compra.ciudad}</p>
    <p><strong>Teléfono:</strong> ${compra.telefono}</p>
    <p><strong>Correo:</strong> ${compra.correo}</p>
    <p><strong>Producto:</strong> ${compra.producto}</p>
  `;

    colRight.innerHTML = `
    <p><strong>Precio:</strong> $ ${(+compra.precioProducto).toFixed(2)}</p>
    <p><strong>Cantidad:</strong> ${compra.cantidad}</p>
    <p><strong>Total:</strong> $ ${total}</p>
    <p><strong>Precio Venta Público:</strong> $ ${compra.precioVentaPublico}</p>
    <p><strong>Autoriza:</strong> ${compra.nombreUsuario}</p>
    <p><strong>Fecha:</strong> ${compra.fecha}</p>
    <p><strong>Hora:</strong> ${compra.hora}</p>
    <p><strong>Ganancia:</strong> $ ${ganancia}</p>
  `;

    modal.style.display = "block";
}


/**
 * Cierra el modal de detalles.
 */
function cerrarDetallesModal() {
    const modal = document.getElementById("modal-detalles");
    if (modal) modal.style.display = "none";
}

export {showConfirmModal, showDetallesModal, cerrarDetallesModal};
