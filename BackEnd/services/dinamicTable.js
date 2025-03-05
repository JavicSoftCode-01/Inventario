import { PurchaseService } from "./comprasServices.js";
import { UserManager } from "./usuarioServices.js";

class DynamicTable {

  static renderTable(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const purchases = PurchaseService.getPurchases();
    const currentSession = UserManager.getCurrentSession();

    tbody.innerHTML = "";
    purchases.forEach((purchase, i) => {
      const canEdit = UserManager.isUserOwner(purchase.nombreUsuario);
      console.log('Permisos para editar:', {
        purchaseId: purchase.id,
        canEdit,
        purchaseUser: purchase.nombreUsuario,
        currentUser: currentSession?.nombreUsuario
      });

      const total = (Number(purchase.precioProducto) || 0) * (Number(purchase.cantidad) || 0);
      const rowNumber = i + 1;

      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${rowNumber}</td>
          <td>${purchase.proveedor}</td>
          <td>${purchase.ciudad}</td>
          <td>${purchase.telefono}</td>
          <td>${purchase.producto}</td>
          <td>$ ${Number(purchase.precioProducto).toFixed(2)}</td>
          <td>${purchase.cantidad}</td>
          <td>$ ${total.toFixed(2)}</td>
          <td>${purchase.autorizador}</td>
          <td>
            <button class="btn-detalles" data-id="${purchase.id}" title="Ver detalles">
              <i class="fa-solid fa-eye"></i>
            </button>
          </td>
          <td>
            ${canEdit ? `
              <button class="btn-editar" data-id="${purchase.id}" title="Editar">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-eliminar" data-id="${purchase.id}" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            ` : `
              <button class="btn-locked" title="No tienes permisos para editar">
                <i class="fa-solid fa-lock"></i>
              </button>
            `}
          </td>
        `;
      tbody.appendChild(tr);
    });
  }

  static renderTableWithData(comprasArray) {
    try {
      const tbody = document.getElementById("compras-tbody");
      if (!tbody) {
        throw new Error("El contenedor de la tabla no fue encontrado");
      }

      const currentSession = UserManager.getCurrentSession();

      // Limpiar el contenido del tbody
      tbody.innerHTML = "";

      // Recorrer el arreglo de compras para crear cada fila
      comprasArray.forEach((compra, index) => {
        const totalToPay =
          (parseFloat(compra.precioProducto) || 0) *
          (parseFloat(compra.cantidad) || 0);
        const rowNumber = index + 1;

        // Validar si el usuario tiene permisos para editar o eliminar
        const canEdit = currentSession && UserManager.isUserOwner(null, compra.nombreUsuario);

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
    } catch (error) {
      console.error("Error al renderizar la tabla con datos:", error);
    }
  }
}

export { DynamicTable };