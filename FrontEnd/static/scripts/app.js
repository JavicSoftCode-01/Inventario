/****************************************
 * IMPORTS (se eliminó SweetAlert2)
 ***************************************/
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
 * RENDER TABLA (inventario.html)
 ***************************************/
function renderizarTablaCompras(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const compras = obtenerCompras();
  tbody.innerHTML = "";

  compras.forEach((compra, i) => {
    const filaNumero = i + 1;
    const totalPagar = (+compra.precioProducto || 0) * (+compra.cantidad || 0);
    const diff = compra.precioVentaPublico - compra.precioProducto;
    const porcentaje =
      compra.precioVentaPublico > 0 && compra.precioProducto > 0
        ? ((diff / compra.precioProducto) * 100).toFixed(2)
        : "N/A";
    const ganancia =
      compra.precioVentaPublico > 0 && compra.precioProducto > 0
        ? diff.toFixed(2)
        : "N/A";
    const colorPorcentaje = diff < 0 ? "red" : "inherit";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${filaNumero}</td>
      <td>${compra.proveedor}</td>
      <td>${compra.ciudad}</td>
      <td>${compra.telefono}</td>
      <td>${compra.correo}</td>
      <td>${compra.producto}</td>
      <td>$ ${(+compra.precioProducto).toFixed(2)}</td>
      <td>${compra.cantidad}</td>
      <td>$ ${totalPagar.toFixed(2)}</td>
      <td>${compra.autorizaCompra}</td>
      <td>${compra.fecha}</td>
      <td>${compra.hora}</td>
      <td>
        <span style="color:${colorPorcentaje}">
          ${porcentaje === "N/A" ? "N/A" : "% " + porcentaje}
          (${ganancia === "N/A" ? "N/A" : "$ " + ganancia})
        </span>
      </td>
      <td>
        <button class="btn-editar" data-id="${compra.id}">
          <i class="fa-solid fa-pencil fa-lg"></i>
        </button>
        <button class="btn-eliminar" data-id="${compra.id}">
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

  const { labels, data } = generarDatos(
    (c) => (+c.precioProducto || 0) * (+c.cantidad || 0)
  );
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
  // Después de 3 segundos se desvanece y se elimina
  setTimeout(() => {
    notification.classList.add("fade-out");
    notification.addEventListener("transitionend", () => {
      notification.remove();
    });
  }, 3000);
}

/****************************************
 * INICIALIZACIÓN DE LA PÁGINA
 ***************************************/
document.addEventListener("DOMContentLoaded", () => {
  // --- Para inventario.html ---
  const tbody = document.getElementById("compras-tbody");
  const form = document.getElementById("form-inventario");
  const modal = document.getElementById("modal-inventario");
  const btnAbrirModal = document.getElementById("btn-abrir-modal");
  const btnCerrarModal = document.getElementById("modal-cerrar");
  const modalTitulo = document.getElementById("modal-titulo");

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

  tbody?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = +btn.dataset.id;

    if (btn.classList.contains("btn-eliminar")) {
      if (window.confirm("¿Eliminar? Esta acción no se puede deshacer.")) {
        eliminarCompra(id);
        renderizarTablaCompras("compras-tbody");
        showNotification("¡Eliminado! El registro fue eliminado.", "success");
      }
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
    }
  });

  // --- Para index.html (widgets, gráficas) ---
  const spanTotalProductos = document.getElementById("widget-total-productos");
  const spanTotalInvertido = document.getElementById("widget-total-capital");
  if (spanTotalProductos) spanTotalProductos.textContent = totalProductosComprados();
  if (spanTotalInvertido) spanTotalInvertido.textContent = totalInvertidoGeneral().toFixed(2);

  dibujarGraficaBarrasChartJS("chart-barras");
  dibujarGraficaLineaChartJS("chart-linea");
});
