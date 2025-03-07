import {PurchaseService} from "./comprasServices.js";
import {UserManager} from "./usuarioServices.js";
import {NotificationManager} from "../../FrontEnd/static/scripts/utils/showNotifications.js";

class DynamicTable {
    static renderTableWithData(comprasArray) {
        try {
            const tbody = document.getElementById("compras-tbody");
            if (!tbody) {
                throw new Error("El contenedor de la tabla no fue encontrado");
            }

            const currentSession = UserManager.getCurrentSession();
            tbody.innerHTML = "";

            comprasArray.forEach((compra, index) => {
                const totalToPay = (parseFloat(compra.precioProducto) || 0) *
                    (parseFloat(compra.cantidad) || 0);
                const rowNumber = index + 1;

                // Corregir la verificación de permisos eliminando el null
                const canEdit = currentSession && UserManager.isUserOwner(compra.nombreUsuario);

                const row = document.createElement("tr");
                row.innerHTML = `
          <td>${rowNumber}</td>
          <td>${compra.proveedor}</td>
          <td>${compra.ciudad}</td>
          <td>${compra.telefono}</td>
          <td>${compra.producto}</td>
          <td>$ ${Number(compra.precioProducto).toFixed(2)}</td>
          <td>${compra.cantidad}</td>
          <td>$ ${totalToPay.toFixed(2)}</td>
          <td>${compra.autorizador}</td>
          <td>
            <div class="stock-control">
              <span class="stock-value">${compra.stock}</span>
              <div class="stock-buttons">
                <button class="btn-stock" data-id="${compra.id}" data-action="increment" ${compra.stock >= compra.cantidad ? 'disabled' : ''}>
                  <i class="fas fa-plus"></i>
                </button>
                <button class="btn-stock" data-id="${compra.id}" data-action="decrement" ${compra.stock <= 0 ? 'disabled' : ''}>
                  <i class="fas fa-minus"></i>
                </button>
              </div>
            </div>
          </td>
          <td>
            <button class="btn-detalles" data-id="${compra.id}" title="Ver detalles">
              <i class="fa-solid fa-eye"></i>
            </button>
          </td>
          <td>
            ${canEdit
                    ? `
                <button class="btn-editar" data-id="${compra.id}" title="Editar">
                  <i class="fa-solid fa-pencil fa-lg"></i>
                </button>
                <button class="btn-eliminar" data-id="${compra.id}" title="Eliminar">
                  <i class="fa-solid fa-trash-can fa-lg"></i>
                </button>
              `
                    : `
                <button class="btn-disabled" disabled title="No tienes permisos">
                  <i class="fa-solid fa-lock fa-lg"></i>
                </button>
              `
                }
          </td>
        `;
                tbody.appendChild(row);
            });

            // Agregar event listeners para los botones de stock
            tbody.querySelectorAll('.btn-stock').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const button = e.target.closest('button');
                    const id = Number(button.dataset.id);
                    const action = button.dataset.action;
                    const change = action === 'increment' ? 1 : -1;

                    const result = PurchaseService.updateStock(id, change);

                    if (result.success) {
                        // Actualizar el valor del stock en la tabla
                        const row = button.closest('tr');
                        const stockValue = row.querySelector('.stock-value');
                        stockValue.textContent = result.updatedPurchase.stock;

                        // Actualizar estado de los botones
                        const incrementBtn = row.querySelector('[data-action="increment"]');
                        const decrementBtn = row.querySelector('[data-action="decrement"]');

                        incrementBtn.disabled = result.updatedPurchase.stock >= result.updatedPurchase.cantidad;
                        decrementBtn.disabled = result.updatedPurchase.stock <= 0;
                    } else {
                        new NotificationManager().showNotification(result.message, "error");
                    }
                });
            });
        } catch (error) {
            console.error("Error al renderizar la tabla con datos:", error);
        }
    }

    static renderTable(tbodyId) {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;

        const purchases = PurchaseService.getPurchases();
        this.renderTableWithData(purchases);
    }
}

export {DynamicTable};