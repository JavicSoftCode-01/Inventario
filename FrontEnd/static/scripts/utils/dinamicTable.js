import {PurchaseService} from "../../../../BackEnd/services/purchaseService.js";
import {AuthManager} from "../../../../BackEnd/services/authServices.js";
import {ExecuteManager} from "../../../../BackEnd/utils/execute.js";

class DynamicTable {
    static createTableCell(content) {
        const td = document.createElement("td");
        td.innerHTML = content;
        return td;
    }

    static createStockControls(compra) {
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
      }, "Stock controls created", "Error creating stock controls:");
  }

  static createActionButtons(compra, canEdit) {
    // Add debugging
    console.log('Checking permissions for:', compra.id);
    console.log('Current user can edit:', canEdit);

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

    static async handleStockUpdate(e) {
      return ExecuteManager.execute(async () => {
          const button = e.target.closest('button');
          if (!button) return;
  
          const id = Number(button.dataset.id);
          const action = button.dataset.action;
          const change = action === 'increment' ? 1 : -1;
  
          // Call service and wait for result
          const result = await PurchaseService.updateStock(id, change);
          
          if (result?.success) {
              const row = button.closest('tr');
              if (!row) return;
  
              // Update stock display
              const stockValue = row.querySelector(`.stock-value[data-id="${id}"]`);
              if (stockValue) {
                  stockValue.textContent = result.updatedPurchase.stock;
              }
  
              // Update buttons
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
      }, "Stock update handled", "Error handling stock update:");
  }

  static createTableRow(compra, index, currentSession) {
    return ExecuteManager.execute(() => {
        const row = document.createElement("tr");
        const totalToPay = (Number(compra.precioProducto) || 0) * (Number(compra.cantidad) || 0);
        
        // Check if current user is the owner of the record
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
    }, "Fila creada correctamente", "Error al crear la fila de la tabla:");
}

    static renderTableWithData(comprasArray) {
        return ExecuteManager.execute(() => {
            const tbody = document.getElementById("compras-tbody");
            if (!tbody) throw new Error("Contenedor de tabla no encontrado");

            const currentSession = AuthManager.getCurrentSession();
            tbody.innerHTML = "";

            comprasArray.forEach((compra, index) => {
                const row = this.createTableRow(compra, index, currentSession);
                tbody.appendChild(row);
            });

            this.attachStockEventListeners(tbody);

        }, "Tabla renderizada correctamente", "Error al renderizar la tabla:");
    }

    static attachStockEventListeners(tbody) {
      return ExecuteManager.execute(() => {
          tbody.querySelectorAll('.btn-stock').forEach(btn => {
              // Remove existing listener to prevent duplicates
              btn.removeEventListener('click', this.handleStockUpdate);
              // Add new listener with bound context
              btn.addEventListener('click', (e) => this.handleStockUpdate(e));
          });
      }, "Stock event listeners attached", "Error attaching stock listeners:");
  }

    static renderTable(tbodyId) {
        return ExecuteManager.execute(() => {
            const tbody = document.getElementById(tbodyId);
            if (!tbody) throw new Error("Contenedor de tabla no encontrado");

            const purchases = PurchaseService.getPurchases();
            this.renderTableWithData(purchases);
            
        }, "Tabla inicializada correctamente", "Error al inicializar la tabla:");
    }
}

export {DynamicTable};