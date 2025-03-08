import {PurchaseService} from "../../../../BackEnd/services/purchaseService.js";
import {AuthManager} from "../../../../BackEnd/services/authServices.js";
import {ExecuteManager} from "../../../../BackEnd/utils/execute.js";

class DynamicTable {

  // >>> Métodos utilizados solo dentro de esta clase <<<

  // Método para crear celda de tabla con contenido.
  createTableCell(content) {
    const td = document.createElement("td");
    td.innerHTML = content;
    return td;
  }

  // Método para crear controles de stock (incrementar/disminuir) para una compra.
  createStockControls(compra) {
    return ExecuteManager.execute(() => {
      return `
                <div style="display: flex; justify-content: center;">
                    <div class="stock-control">
                        <div class="stock-buttons">
                            <button class="btn-stock" 
                                    data-id="${compra.id}" 
                                    data-action="increment"
                                    data-stock="${compra.stock}"
                                    data-cantidad="${compra.cantidad}"
                                    ${compra.stock >= compra.cantidad ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                            <span class="stock-value" data-id="${compra.id}">${compra.stock}</span>
                            <button class="btn-stock" 
                                    data-id="${compra.id}" 
                                    data-action="decrement"
                                    data-stock="${compra.stock}"
                                    ${compra.stock <= 0 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
    }, "Exito! Al crear controles de stock.", "Error! Al crear controles de stock:");
  }

  // Método para crear botones de acción (editar/eliminar) según los permisos del usuario.
  createActionButtons(compra, canEdit) {
    return canEdit ? `
            <button class="btn-editar" data-id="${compra.id}" title="Editar">
                <i class="fa-solid fa-pencil fa-lg"></i>
            </button>
            <button class="btn-eliminar" data-id="${compra.id}" title="Eliminar">
                <i class="fa-solid fa-trash-can fa-lg"></i>
            </button>
        ` : `
            <button class="btn-disabled" disabled title="No tienes permisos">
                <i class="fa-solid fa-lock fa-lg"></i>
            </button>
        `;
  }

  // Método para crear una fila de tabla con los datos de una compra, incluyendo controles de stock y botones de acción.
  createTableRow(compra, index, currentSession) {
    return ExecuteManager.execute(() => {
      const row = document.createElement("tr");
      const totalToPay = (Number(compra.precioProducto) || 0) * (Number(compra.cantidad) || 0);
      const canEdit = currentSession?.nombreUsuario === compra.nombreUsuario;

      const rowContent = [
        index + 1,
        compra.proveedor,
        compra.ciudad,
        compra.telefono,
        compra.producto,
        `$ ${Number(compra.precioProducto).toFixed(2)}`,
        compra.cantidad,
        `$ ${totalToPay.toFixed(2)}`,
        compra.autorizador,
        this.createStockControls(compra),
        `<button class="btn-detalles" data-id="${compra.id}" title="Ver detalles">
                    <i class="fa-solid fa-eye"></i>
                </button>`,
        this.createActionButtons(compra, canEdit)
      ];

      rowContent.forEach(content => {
        row.appendChild(this.createTableCell(content));
      });

      return row;
    }, "Exito! Al crear fila de tabla.", "Error! Al crear fila de tabla:");
  }

  // >>> Métodos estáticos utilizados en otros archivos <<<

  /**
   * 🔰 Método para manejar actualización de stock 🔰
   */
  static async handleStockUpdate(e) {
    return ExecuteManager.execute(async () => {
      const button = e.target.closest('button');
      if (!button) return;

      const id = Number(button.dataset.id);
      const action = button.dataset.action;
      const change = action === 'increment' ? 1 : -1;

      const result = await PurchaseService.updateStock(id, change);

      if (result?.success) {
        const row = button.closest('tr');
        if (!row) return;

        const stockValue = row.querySelector(`.stock-value[data-id="${id}"]`);
        if (stockValue) {
          stockValue.textContent = result.updatedPurchase.stock;
        }

        const incrementBtn = row.querySelector(`[data-action="increment"][data-id="${id}"]`);
        const decrementBtn = row.querySelector(`[data-action="decrement"][data-id="${id}"]`);

        if (incrementBtn) {
          incrementBtn.disabled = result.updatedPurchase.stock >= result.updatedPurchase.cantidad;
          incrementBtn.dataset.stock = result.updatedPurchase.stock;
        }
        if (decrementBtn) {
          decrementBtn.disabled = result.updatedPurchase.stock <= 0;
          decrementBtn.dataset.stock = result.updatedPurchase.stock;
        }
      }
    }, "Exito! Al actualizar stock.", "Error! Al actualizar stock:");
  }

  /**
   * 🔰 Método para renderizar tabla con datos. 🔰
   */
  static renderTableWithData(comprasArray) {
    const table = new DynamicTable();
    return ExecuteManager.execute(() => {
      const tbody = document.getElementById("compras-tbody");
      if (!tbody) throw new Error("Contenedor de tabla no encontrado");

      const currentSession = AuthManager.getCurrentSession();
      tbody.innerHTML = "";

      comprasArray.forEach((compra, index) => {
        const row = table.createTableRow(compra, index, currentSession);
        tbody.appendChild(row);
      });

      DynamicTable.attachStockEventListeners(tbody);
    }, "Exito!  Al renderizar tabla.", "Error! Al renderizar tabla:");
  }

  /**
   * 🔰 Método para inicializar tabla. 🔰
   */
  static renderTable(tbodyId) {
    return ExecuteManager.execute(() => {
      const tbody = document.getElementById(tbodyId);
      if (!tbody) throw new Error("Contenedor de tabla no encontrado");

      const purchases = PurchaseService.getPurchases();
      DynamicTable.renderTableWithData(purchases);
    }, "Exito! Al inicializar tabla.", "Error! Al inicializar tabla:");
  }

  /**
   * 🔰 Método para adjuntar eventos de stock. 🔰
   */
  static attachStockEventListeners(tbody) {
    return ExecuteManager.execute(() => {
      tbody.querySelectorAll('.btn-stock').forEach(btn => {
        btn.removeEventListener('click', DynamicTable.handleStockUpdate);
        btn.addEventListener('click', (e) => DynamicTable.handleStockUpdate(e));
      });
    }, "Exito! Al adjuntar eventos de stock.", "Error! Al adjuntar eventos de stock:");
  }
}

export {DynamicTable};