import { Compra } from "../../../BackEnd/models/models.js";
import { getData, setData } from "../../../BackEnd/database/localStorage.js";

/****************************************
 * CONSTANTES Y UTILIDADES
 ***************************************/
const KEY_COMPRAS = "compras";
function obtenerFechaYHora() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  const fecha = `${anio}-${mes}-${dia}`;
  let horas = ahora.getHours();
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const sufijo = horas >= 12 ? "PM" : "AM";
  horas = horas % 12 || 12;
  const horaStr = `${horas}:${minutos} ${sufijo}`;
  return { fecha, hora: horaStr };
}

/****************************************
 * DB: GET/SET
 ***************************************/
function obtenerCompras() {
  return getData(KEY_COMPRAS);
}
function guardarCompras(compras) {
  setData(KEY_COMPRAS, compras);
}

/****************************************
 * CRUD COMPRAS
 ***************************************/
function crearCompra(datos) {
  const compras = obtenerCompras();
  const { fecha, hora } = obtenerFechaYHora();
  compras.push(
    new Compra(
      Date.now(),
      datos.proveedor,
      datos.ciudad,
      datos.telefono,
      datos.correo,
      datos.producto,
      +datos.precioProducto,
      +datos.cantidad,
      datos.autorizaCompra,
      +datos.precioVentaPublico,
      fecha,
      hora
    )
  );
  guardarCompras(compras);
}
function eliminarCompra(id) {
  guardarCompras(obtenerCompras().filter((c) => c.id !== id));
}
function actualizarCompra(id, datos) {
  const compras = obtenerCompras();
  const idx = compras.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  const compraOriginal = compras[idx];
  compras[idx] = new Compra(
    id,
    datos.proveedor,
    datos.ciudad,
    datos.telefono,
    datos.correo,
    datos.producto,
    +datos.precioProducto || 0,
    +datos.cantidad || 0,
    datos.autorizaCompra,
    +datos.precioVentaPublico || 0,
    compraOriginal.fecha,
    compraOriginal.hora
  );
  guardarCompras(compras);
  return true;
}

/****************************************
 * BUSQUEDAS Y FILTROS
 ***************************************/
function calcularTotal(compra) {
  return (+compra.precioProducto || 0) * (+compra.cantidad || 0);
}
function filtrarComprasPorQuery(query) {
  const todasCompras = obtenerCompras();
  const q = query.toLowerCase();
  return todasCompras.filter((compra) => {
    return compra.proveedor.toLowerCase().includes(q) ||
           compra.autorizaCompra.toLowerCase().includes(q) ||
            compra.telefono.toLowerCase().includes(q);
  });
}
function filtrarComprasPorTotal(orden = "max") {
  const todasCompras = obtenerCompras();
  if (!todasCompras.length) return [];
  const totales = todasCompras.map(calcularTotal);
  const valorFiltro = orden === "max" ? Math.max(...totales) : Math.min(...totales);
  return todasCompras.filter((compra) => calcularTotal(compra) === valorFiltro);
}

/****************************************
 * RENDER TABLA (inventario.html)
 ***************************************/
function renderizarTablaCompras(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const compras = obtenerCompras();
  tbody.innerHTML = "";
  compras.forEach((compra, i) => {
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

/****************************************
 * WIDGETS (index.html)
 ***************************************/
function totalProductosComprados() {
  return obtenerCompras().reduce((acc, c) => acc + (+c.cantidad || 0), 0);
}
function totalInvertidoGeneral() {
  return obtenerCompras().reduce(
    (acc, c) => acc + ((+c.precioProducto || 0) * (+c.cantidad || 0)),
    0
  );
}

/****************************************
 * GRÁFICAS CON CHART.JS
 ***************************************/
function generarDatos(callback) {
  const mapa = {};
  obtenerCompras().forEach((c) => {
    if (!mapa[c.fecha]) mapa[c.fecha] = 0;
    mapa[c.fecha] += callback(c);
  });
  return { labels: Object.keys(mapa), data: Object.values(mapa) };
}
function dibujarGraficaBarrasChartJS(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { labels, data } = generarDatos((c) => +c.cantidad || 0);
  if (!labels.length) return;
  new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Productos comprados por día",
          data,
          backgroundColor: "rgba(76, 175, 80, 0.7)",
          borderColor: "#4caf50",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      scales: {
        x: { ticks: { color: "#fff" }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: "#fff" }, grid: { color: "#555" } },
      },
      plugins: { legend: { labels: { color: "#fff" } } },
    },
  });
}
function dibujarGraficaLineaChartJS(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { labels, data } = generarDatos((c) => (+c.precioProducto || 0) * (+c.cantidad || 0));
  if (!labels.length) return;
  new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Dinero Invertido por Día",
          data,
          fill: "start",
          backgroundColor: "rgba(255, 87, 34, 0.3)",
          borderColor: "#FF5722",
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      scales: {
        x: { ticks: { color: "#fff" }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: "#fff" }, grid: { color: "#555" } },
      },
      plugins: { legend: { labels: { color: "#fff" } } },
    },
  });
}

/****************************************
 * NOTIFICACIONES PERSONALIZADAS
 ***************************************/
function showNotification(message, type = "success") {
  const container = document.getElementById("notification-container");
  if (!container) return;
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerText = message;
  container.appendChild(notification);
  setTimeout(() => {
    notification.classList.add("fade-out");
    notification.addEventListener("transitionend", () => {
      notification.remove();
    });
  }, 3000);
}

/****************************************
 * MODAL DE CONFIRMACIÓN PERSONALIZADO
 ***************************************/
function showConfirmModal(message, onConfirm, onCancel) {
  const modal = document.getElementById("confirm-modal");
  const messageEl = document.getElementById("confirm-modal-message");
  const yesBtn = document.getElementById("confirm-modal-yes");
  const noBtn = document.getElementById("confirm-modal-no");
  messageEl.textContent = message;
  modal.style.display = "flex";
  yesBtn.onclick = function() {
    modal.style.display = "none";
    if (typeof onConfirm === "function") onConfirm();
  };
  noBtn.onclick = function() {
    modal.style.display = "none";
    if (typeof onCancel === "function") onCancel();
  };
}

/****************************************
 * MODAL DE DETALLES
 ***************************************/
function showDetallesModal(compra, filaNumero) {
  const modal = document.getElementById("modal-detalles");
  const colLeft = document.getElementById("detalles-col-left");
  const colRight = document.getElementById("detalles-col-right");
  const total = calcularTotal(compra).toFixed(2);
  const ganancia = (compra.precioVentaPublico - compra.precioProducto).toFixed(2);
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
    <p><strong>Autoriza:</strong> ${compra.autorizaCompra}</p>
    <p><strong>Fecha:</strong> ${compra.fecha}</p>
    <p><strong>Hora:</strong> ${compra.hora}</p>
    <p><strong>Ganancia:</strong> $ ${ganancia}</p>
  `;
  modal.style.display = "block";
}
function cerrarDetallesModal() {
  const modal = document.getElementById("modal-detalles");
  if (modal) modal.style.display = "none";
}

/****************************************
 * INICIALIZACIÓN DE LA PÁGINA
 ***************************************/
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("compras-tbody");
  const form = document.getElementById("form-inventario");
  const modal = document.getElementById("modal-inventario");
  const btnAbrirModal = document.getElementById("btn-abrir-modal");
  const btnCerrarModal = document.getElementById("modal-cerrar");
  const modalTitulo = document.getElementById("modal-titulo");
  const searchInput = document.getElementById("search-input");
  const btnFilterHigh = document.getElementById("btn-filter-high");
  const btnFilterLow = document.getElementById("btn-filter-low");
  const btnRefresh = document.getElementById("btn-refresh");

  const inputId = document.getElementById("compra-id");
  const inputProveedor = document.getElementById("prov-proveedor");
  const inputCiudad = document.getElementById("prov-ciudad");
  const inputTelefono = document.getElementById("prov-telefono");
  const inputCorreo = document.getElementById("prov-correo");
  const inputProducto = document.getElementById("prov-producto");
  const inputPrecio = document.getElementById("prov-precio");
  const inputCantidad = document.getElementById("prov-cantidad");
  const inputTotal = document.getElementById("prov-total");
  const inputAutoriza = document.getElementById("prov-autoriza");
  const inputPrecioVentaPublico = document.getElementById("prov-precioVentaPublico");

  if (tbody) renderizarTablaCompras("compras-tbody");

  function abrirModal() {
    if (modal) modal.style.display = "block";
  }
  function cerrarModal() {
    if (modal) modal.style.display = "none";
  }
  if (btnAbrirModal) {
    btnAbrirModal.addEventListener("click", () => {
      if (modalTitulo) modalTitulo.textContent = "Nueva Compra";
      form?.reset();
      if (inputId) inputId.value = "";
      if (inputTotal) inputTotal.value = "";
      abrirModal();
    });
  }
  if (btnCerrarModal) btnCerrarModal.addEventListener("click", cerrarModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });
  function recalcularTotal() {
    const precio = parseFloat(inputPrecio?.value) || 0;
    const cantidad = parseFloat(inputCantidad?.value) || 0;
    if (inputTotal) inputTotal.value = (precio * cantidad).toFixed(2);
  }
  inputPrecio?.addEventListener("input", recalcularTotal);
  inputCantidad?.addEventListener("input", recalcularTotal);
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const hiddenId = inputId?.value.trim();
    const datos = {
      proveedor: inputProveedor?.value,
      ciudad: inputCiudad?.value,
      telefono: inputTelefono?.value,
      correo: inputCorreo?.value,
      producto: inputProducto?.value,
      precioProducto: inputPrecio?.value,
      cantidad: inputCantidad?.value,
      autorizaCompra: inputAutoriza?.value,
      precioVentaPublico: inputPrecioVentaPublico?.value
    };
    cerrarModal();
    if (hiddenId) {
      actualizarCompra(+hiddenId, datos);
      showNotification("¡Actualizado! El registro se actualizó con éxito", "success");
    } else {
      crearCompra(datos);
      showNotification("¡Creado! El registro se creó con éxito", "success");
    }
    form.reset();
    if (inputId) inputId.value = "";
    if (inputTotal) inputTotal.value = "";
    renderizarTablaCompras("compras-tbody");
  });
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim();
      if (query === "") {
        renderizarTablaCompras("compras-tbody");
      } else {
        const filtradas = filtrarComprasPorQuery(query);
        renderizarTablaComprasConDatos(filtradas);
      }
    });
  }
  if (btnFilterHigh) {
    btnFilterHigh.addEventListener("click", () => {
      const filtradas = filtrarComprasPorTotal("max");
      renderizarTablaComprasConDatos(filtradas);
    });
  }
  if (btnFilterLow) {
    btnFilterLow.addEventListener("click", () => {
      const filtradas = filtrarComprasPorTotal("min");
      renderizarTablaComprasConDatos(filtradas);
    });
  }
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      renderizarTablaCompras("compras-tbody");
    });
  }
  tbody?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = +btn.dataset.id;
    if (btn.classList.contains("btn-eliminar")) {
      const compra = obtenerCompras().find((c) => c.id === id);
      if (!compra) return;
      const compras = obtenerCompras();
      const rowIndex = compras.findIndex((c) => c.id === id) + 1;
      const message = `Está a punto de eliminar la fila #${rowIndex} del proveedor "${compra.proveedor}", compra autorizada por ${compra.autorizaCompra}. Esta acción es irreversible. ¿Desea proceder con la eliminación?`;
      showConfirmModal(
        message,
        () => {
          eliminarCompra(id);
          renderizarTablaCompras("compras-tbody");
          showNotification("¡Eliminado! El registro fue eliminado.", "success");
        },
        () => {}
      );
    } else if (btn.classList.contains("btn-editar")) {
      const compra = obtenerCompras().find((c) => c.id === id);
      if (!compra) return;
      if (modalTitulo) modalTitulo.textContent = "Editar Compra";
      if (inputId) inputId.value = compra.id;
      if (inputProveedor) inputProveedor.value = compra.proveedor;
      if (inputCiudad) inputCiudad.value = compra.ciudad;
      if (inputTelefono) inputTelefono.value = compra.telefono;
      if (inputCorreo) inputCorreo.value = compra.correo;
      if (inputProducto) inputProducto.value = compra.producto;
      if (inputPrecio) inputPrecio.value = compra.precioProducto;
      if (inputCantidad) inputCantidad.value = compra.cantidad;
      if (inputAutoriza) inputAutoriza.value = compra.autorizaCompra;
      if (inputPrecioVentaPublico) inputPrecioVentaPublico.value = compra.precioVentaPublico;
      recalcularTotal();
      abrirModal();
    } else if (btn.classList.contains("btn-detalles")) {
      const compra = obtenerCompras().find((c) => c.id === id);
      if (!compra) return;
      const compras = obtenerCompras();
      const rowIndex = compras.findIndex((c) => c.id === id) + 1;
      showDetallesModal(compra, rowIndex);
    }
  });
  const spanTotalProductos = document.getElementById("widget-total-productos");
  const spanTotalInvertido = document.getElementById("widget-total-capital");
  if (spanTotalProductos) spanTotalProductos.textContent = totalProductosComprados();
  if (spanTotalInvertido) spanTotalInvertido.textContent = totalInvertidoGeneral().toFixed(2);
  dibujarGraficaBarrasChartJS("chart-barras");
  dibujarGraficaLineaChartJS("chart-linea");
  const btnCerrarDetalles = document.getElementById("modal-detalles-cerrar");
  if (btnCerrarDetalles) {
    btnCerrarDetalles.addEventListener("click", cerrarDetallesModal);
  }
});
export {
  crearCompra,
  actualizarCompra,
  eliminarCompra,
  obtenerCompras,
  renderizarTablaCompras,
  totalProductosComprados,
  totalInvertidoGeneral,
  dibujarGraficaBarrasChartJS,
  dibujarGraficaLineaChartJS,
};
