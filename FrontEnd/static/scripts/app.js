import * as Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js";
import { Compra } from "../../../BackEnd/models/models.js";
import { getData, setData } from "../../../BackEnd/database/localStorage.js";

const KEY_COMPRAS = "compras";

/* =======================================
   UTILIDADES
======================================= */
function obtenerFechaYHora() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  const fecha = `${anio}-${mes}-${dia}`;

  let horas = ahora.getHours();
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const sufijo = horas >= 12 ? "PM" : "AM";
  horas = horas % 12;
  if (horas === 0) horas = 12;
  const horaStr = `${horas}:${minutos} ${sufijo}`;

  return { fecha, hora: horaStr };
}

/* =======================================
   CRUD COMPRAS
======================================= */
function obtenerCompras() {
  return getData(KEY_COMPRAS);
}

function guardarCompras(compras) {
  setData(KEY_COMPRAS, compras);
}

// Crear
function crearCompra(datos) {
  const compras = obtenerCompras();
  const { fecha, hora } = obtenerFechaYHora();

  const nuevaCompra = new Compra(
    Date.now(),
    datos.proveedor,
    datos.ciudad,
    datos.telefono,
    datos.correo,
    datos.producto,
    Number(datos.precioProducto),
    Number(datos.cantidad),
    datos.autorizaCompra,
    Number(datos.precioVentaPublico),
    fecha,
    hora
  );

  compras.push(nuevaCompra);
  guardarCompras(compras);
  // Quitamos el SweetAlert de aquí para manejarlo en el evento submit
}

// Eliminar
function eliminarCompra(id) {
  let compras = obtenerCompras();
  compras = compras.filter((c) => c.id !== id);
  guardarCompras(compras);
  // Quitamos el SweetAlert de aquí para manejarlo en el evento de click
}

// Actualizar
function actualizarCompra(id, datos) {
  const compras = obtenerCompras();
  const idx = compras.findIndex((c) => c.id === id);
  if (idx === -1) {
    console.error("No se encontró la compra a actualizar.");
    return false;
  }

  const precio = parseFloat(datos.precioProducto) || 0;
  const cant = parseFloat(datos.cantidad) || 0;
  const precioVenta = parseFloat(datos.precioVentaPublico) || 0;
  const compraOriginal = compras[idx];
  const fecha = compraOriginal.fecha;
  const hora = compraOriginal.hora;

  compras[idx] = new Compra(
    id,
    datos.proveedor,
    datos.ciudad,
    datos.telefono,
    datos.correo,
    datos.producto,
    precio,
    cant,
    datos.autorizaCompra,
    precioVenta,
    fecha,
    hora
  );

  guardarCompras(compras);
  // Quitamos el SweetAlert de aquí para manejarlo en el evento submit
  return true;
}

/* =======================================
   RENDER DE TABLA (inventario.html)
======================================= */
function renderizarTablaCompras(contenedorTbodyId) {
  const tbody = document.getElementById(contenedorTbodyId);
  if (!tbody) return;
  const compras = obtenerCompras();
  tbody.innerHTML = "";
  compras.forEach((compra, i) => {
    const filaNumero = i + 1;
    const totalPagar =
      (parseFloat(compra.precioProducto) || 0) *
      (parseFloat(compra.cantidad) || 0);
    const porcentaje =
      compra.precioVentaPublico > 0 && compra.precioProducto > 0
        ? (((compra.precioVentaPublico - compra.precioProducto) / compra.precioProducto) * 100).toFixed(2)
        : "N/A";
    const ganancia =
      compra.precioVentaPublico > 0 && compra.precioProducto > 0
        ? (compra.precioVentaPublico - compra.precioProducto).toFixed(2)
        : "N/A";
    const colorPorcentaje =
      compra.precioVentaPublico > 0 &&
      compra.precioProducto > 0 &&
      (compra.precioVentaPublico - compra.precioProducto) < 0
        ? "red"
        : "inherit";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${filaNumero}</td>
      <td>${compra.proveedor}</td>
      <td>${compra.ciudad}</td>
      <td>${compra.telefono}</td>
      <td>${compra.correo}</td>
      <td>${compra.producto}</td>
      <td>$ ${parseFloat(compra.precioProducto).toFixed(2)}</td>
      <td>${compra.cantidad}</td>
      <td>$ ${totalPagar.toFixed(2)}</td>
      <td>${compra.autorizaCompra}</td>
      <td>${compra.fecha}</td>
      <td>${compra.hora}</td>
      <td>
        <span style="color: ${colorPorcentaje};">
          ${porcentaje === "N/A" ? "N/A" : "% " + porcentaje}
          (${ganancia === "N/A" ? "N/A" : "$ " + ganancia})
        </span>
      </td>
      <td>
        <button class="btn-editar" data-id="${compra.id}"><i class="fa-solid fa-pencil fa-lg"></i></button>
        <button class="btn-eliminar" data-id="${compra.id}"><i class="fa-solid fa-trash-can fa-lg"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* =======================================
   WIDGETS y GRÁFICAS (index.html)
======================================= */
function totalProductosComprados() {
  const compras = obtenerCompras();
  let total = 0;
  compras.forEach((c) => {
    total += c.cantidad;
  });
  return total;
}

function totalInvertidoGeneral() {
  const compras = obtenerCompras();
  let totalInvertido = 0;
  compras.forEach((c) => {
    totalInvertido += c.precioProducto * c.cantidad;
  });
  return totalInvertido;
}

function generarDatosBarras() {
  const compras = obtenerCompras();
  const mapa = {};
  compras.forEach((c) => {
    if (!mapa[c.fecha]) mapa[c.fecha] = 0;
    mapa[c.fecha] += c.cantidad;
  });
  return { labels: Object.keys(mapa), data: Object.values(mapa) };
}

function generarDatosLinea() {
  const compras = obtenerCompras();
  const mapa = {};
  compras.forEach((c) => {
    if (!mapa[c.fecha]) mapa[c.fecha] = 0;
    mapa[c.fecha] += c.precioProducto * c.cantidad;
  });
  return { labels: Object.keys(mapa), data: Object.values(mapa) };
}

/* ======================
   CHART.JS (usando Chart.js)
====================== */
function dibujarGraficaBarrasChartJS(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { labels, data } = generarDatosBarras();
  if (!labels.length) return;
  new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Productos comprados por día",
        data,
        backgroundColor: "rgba(76, 175, 80, 0.7)",
        borderColor: "#4caf50",
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      scales: {
        x: { ticks: { color: "#fff" }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: "#fff" }, grid: { color: "#555" } },
      },
      plugins: {
        legend: { labels: { color: "#fff" } },
      },
    },
  });
}

function dibujarGraficaLineaChartJS(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { labels, data } = generarDatosLinea();
  if (!labels.length) return;
  new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Dinero Invertido por Día",
        data,
        fill: "start",
        backgroundColor: "rgba(255, 87, 34, 0.3)",
        borderColor: "#FF5722",
        borderWidth: 2,
        tension: 0.3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      scales: {
        x: { ticks: { color: "#fff" }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: "#fff" }, grid: { color: "#555" } },
      },
      plugins: {
        legend: { labels: { color: "#fff" } },
      },
    },
  });
}

/* Exportamos las funciones */
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

document.addEventListener("DOMContentLoaded", () => {
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

  // Renderizar tabla con datos existentes al cargar
  renderizarTablaCompras("compras-tbody");

  // Función para abrir modal
  function abrirModal() {
    modal.style.display = "block";
  }
  // Función para cerrar modal
  function cerrarModal() {
    modal.style.display = "none";
  }

  // Abrir modal para crear nuevo registro
  btnAbrirModal.addEventListener("click", () => {
    modalTitulo.textContent = "Nueva Compra";
    form.reset();
    inputId.value = "";
    inputTotal.value = "";
    abrirModal();
  });

  // Cerrar modal al hacer clic en la X
  btnCerrarModal.addEventListener("click", cerrarModal);

  // Cerrar modal al hacer clic fuera del contenido
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      cerrarModal();
    }
  });

  // Cálculo automático del total
  function recalcularTotal() {
    const precio = parseFloat(inputPrecio.value) || 0;
    const cantidad = parseFloat(inputCantidad.value) || 0;
    const total = precio * cantidad;
    inputTotal.value = total.toFixed(2);
  }
  inputPrecio.addEventListener("input", recalcularTotal);
  inputCantidad.addEventListener("input", recalcularTotal);

  // Guardar registro (crear o actualizar)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const hiddenId = inputId.value.trim();
    const datos = {
      proveedor: inputProveedor.value,
      ciudad: inputCiudad.value,
      telefono: inputTelefono.value,
      correo: inputCorreo.value,
      producto: inputProducto.value,
      precioProducto: inputPrecio.value,
      cantidad: inputCantidad.value,
      autorizaCompra: inputAutoriza.value,
      precioVentaPublico: inputPrecioVentaPublico.value
    };

    // Primero cerramos el modal para evitar congelamiento
    cerrarModal();

    if (hiddenId) {
      actualizarCompra(Number(hiddenId), datos);
      await Swal.fire({
        title: "¡Actualizado!",
        text: "El registro se actualizó con éxito",
        icon: "success",
        confirmButtonColor: "#00e676"
      });
    } else {
      crearCompra(datos);
      await Swal.fire({
        title: "¡Creado!",
        text: "El registro se creó con éxito",
        icon: "success",
        confirmButtonColor: "#00e676"
      });
    }

    form.reset();
    inputId.value = "";
    inputTotal.value = "";
    // Actualizamos la tabla después de mostrar el SweetAlert
    renderizarTablaCompras("compras-tbody");
  });

  // Eventos para Editar y Eliminar en la tabla
  tbody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-eliminar")) {
      const id = Number(e.target.dataset.id);
      const result = await Swal.fire({
        title: "¿Eliminar?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });
      
      if (result.isConfirmed) {
        eliminarCompra(id);
        // Actualizamos la tabla inmediatamente después de eliminar
        renderizarTablaCompras("compras-tbody");
        await Swal.fire({
          title: "¡Eliminado!",
          text: "El registro fue eliminado.",
          icon: "success",
          confirmButtonColor: "#00e676"
        });
      }
    } else if (e.target.classList.contains("btn-editar")) {
      const id = Number(e.target.dataset.id);
      const compras = obtenerCompras();
      const compra = compras.find((c) => c.id === id);
      if (compra) {
        modalTitulo.textContent = "Editar Compra";
        inputId.value = compra.id;
        inputProveedor.value = compra.proveedor;
        inputCiudad.value = compra.ciudad;
        inputTelefono.value = compra.telefono;
        inputCorreo.value = compra.correo;
        inputProducto.value = compra.producto;
        inputPrecio.value = compra.precioProducto;
        inputCantidad.value = compra.cantidad;
        inputAutoriza.value = compra.autorizaCompra;
        inputPrecioVentaPublico.value = compra.precioVentaPublico;
        recalcularTotal();
        abrirModal();
      }
    }
  });
});
