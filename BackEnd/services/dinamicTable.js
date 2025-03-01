import { obtenerCompras } from "./comprasServices.js"; 

function renderizarTablaCompras(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const compras = obtenerCompras();
    tbody.innerHTML = "";
    compras.forEach((compra, i) => {
      const totalPagar =
      (parseFloat(compra.precioProducto) || 0) *
      (parseFloat(compra.cantidad) || 0);
      const filaNumero = i + 1;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${filaNumero}</td>
        <td>${compra.proveedor}</td>
        <td>${compra.ciudad}</td>
        <td>${compra.telefono}</td>
        <td>${compra.producto}</td>
        <td>$ ${(+compra.precioProducto).toFixed(2)}</td>
        <td>${compra.cantidad}</td>
        <td>$ ${totalPagar.toFixed(2)}</td>
        <td>${compra.autorizaCompra}</td>
        <td>
          <button class="btn-detalles" data-id="${compra.id}" title="Ver detalles">
            <i class="fa-solid fa-eye"></i>
          </button>
        </td>
        <td>
          <button class="btn-editar" data-id="${compra.id}" title="Editar">
            <i class="fa-solid fa-pencil fa-lg"></i>
          </button>
          <button class="btn-eliminar" data-id="${compra.id}" title="Eliminar">
            <i class="fa-solid fa-trash-can fa-lg"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  function renderizarTablaComprasConDatos(comprasArray) {
    const tbody = document.getElementById("compras-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    comprasArray.forEach((compra, i) => {
      const totalPagar =
      (parseFloat(compra.precioProducto) || 0) *
      (parseFloat(compra.cantidad) || 0);
      const filaNumero = i + 1;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${filaNumero}</td>
        <td>${compra.proveedor}</td>
        <td>${compra.ciudad}</td>
        <td>${compra.telefono}</td>
        <td>${compra.producto}</td>
        <td>$ ${(+compra.precioProducto).toFixed(2)}</td>
        <td>${compra.cantidad}</td>
        <td>$ ${totalPagar.toFixed(2)}</td>
        <td>${compra.autorizaCompra}</td>
        <td>
          <button class="btn-detalles" data-id="${compra.id}" title="Ver detalles">
            <i class="fa-solid fa-eye"></i>
          </button>
        </td>
        <td>
          <button class="btn-editar" data-id="${compra.id}" title="Editar">
            <i class="fa-solid fa-pencil fa-lg"></i>
          </button>
          <button class="btn-eliminar" data-id="${compra.id}" title="Eliminar">
            <i class="fa-solid fa-trash-can fa-lg"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

export { renderizarTablaCompras, renderizarTablaComprasConDatos };