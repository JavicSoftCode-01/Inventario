// FrontEnd/static/scripts/app.js

import { Compra } from "../../../BackEnd/models/models.js";
import { getData, setData } from "../../../BackEnd/database/localStorage.js";

const KEY_COMPRAS = "compras";

/* =======================================
   UTILIDADES
======================================= */
function mostrarAlerta(mensaje) {
  alert(mensaje);
}

// Devuelve la fecha y hora actuales con AM/PM
function obtenerFechaYHora() {
  const ahora = new Date();
  // Fecha en formato YYYY-MM-DD (puedes personalizar)
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  const fecha = `${anio}-${mes}-${dia}`;

  // Hora en formato hh:mm AM/PM
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

function crearCompra(datos) {
  const compras = obtenerCompras();
  const { fecha, hora } = obtenerFechaYHora();
  const nuevaCompra = new Compra(
    Date.now(),                // id
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
  mostrarAlerta("Compra registrada con éxito.");
}

function eliminarCompra(id) {
  let compras = obtenerCompras();
  compras = compras.filter((c) => c.id !== id);
  guardarCompras(compras);
  mostrarAlerta("Compra eliminada.");
}

// Actualizar
function actualizarCompra(id, datos) {
  const compras = obtenerCompras();
  const idx = compras.findIndex((c) => c.id === id);
  if (idx === -1) {
    mostrarAlerta("No se encontró la compra a actualizar.");
    return;
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
  mostrarAlerta("Compra actualizada con éxito.");
}

/* =======================================
   RENDER DE TABLA (inventario.html)
======================================= */

// Renderiza la tabla y reindexa las filas (#)
function renderizarTablaCompras(contenedorTbodyId) {
  const tbody = document.getElementById(contenedorTbodyId);
  if (!tbody) return;

  const compras = obtenerCompras();
  tbody.innerHTML = "";

  compras.forEach((compra, i) => {
    const filaNumero = i + 1;

    // Calcular total a pagar multiplicando precioProducto x cantidad
    const totalPagar = (parseFloat(compra.precioProducto) || 0) * (parseFloat(compra.cantidad) || 0);

    // Solo se calcula el % y ganancia si se ingresó precioVentaPublico > 0 y precioProducto > 0
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
      <td>$${parseFloat(compra.precioProducto).toFixed(2)}</td>
      <td>${compra.cantidad}</td>
      <td>$${totalPagar.toFixed(2)}</td>
      <td>${compra.autorizaCompra}</td>
      <td>${compra.fecha}</td>
      <td>${compra.hora}</td>
      <td>
        <span style="color: ${colorPorcentaje};">
          ${porcentaje === "N/A" ? "N/A" : "% " + porcentaje} (${ganancia === "N/A" ? "N/A" : "$ " + ganancia})
        </span>
      </td>
      <td>
        <button class="btn-editar" data-id="${compra.id}">Editar</button>
        <button class="btn-eliminar" data-id="${compra.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* =======================================
   WIDGETS y GRÁFICAS (index.html)
======================================= */

// 1) Widget: Total de productos comprados
function totalProductosComprados() {
  const compras = obtenerCompras();
  // Suma de todas las cantidades
  let total = 0;
  compras.forEach((c) => {
    total += c.cantidad;
  });
  return total;
}

// 2) Widget: Total invertido en X producto (ejemplo, el que tú quieras)
function totalInvertidoGeneral() {
  const compras = obtenerCompras();
  let totalInvertido = 0;
  compras.forEach((c) => {
    totalInvertido += (c.precioProducto * c.cantidad); // Calcula correctamente el total
  });
  return totalInvertido;
}


// Generar datos para la gráfica de barras (cantidad de productos por día)
function generarDatosBarras() {
  const compras = obtenerCompras();
  // Estructura: { '2025-03-01': cantidadTotalEseDia, ... }
  const mapa = {};
  compras.forEach((c) => {
    if (!mapa[c.fecha]) {
      mapa[c.fecha] = 0;
    }
    mapa[c.fecha] += c.cantidad;
  });
  // Convertimos en arrays de labels y data
  const labels = Object.keys(mapa);
  const data = Object.values(mapa);
  return { labels, data };
}

// Generar datos para la gráfica de línea/montaña (dinero invertido por día)
function generarDatosLinea() {
  const compras = obtenerCompras();
  const mapa = {};
  compras.forEach((c) => {
    if (!mapa[c.fecha]) {
      mapa[c.fecha] = 0;
    }
    mapa[c.fecha] += (c.precioProducto * c.cantidad); // Calcula correctamente el total invertido por día
  });
  const labels = Object.keys(mapa);
  const data = Object.values(mapa);
  return { labels, data };
}

/* ======================
   CHART.JS
====================== */

// Gráfica de barras con Chart.js
function dibujarGraficaBarrasChartJS(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const { labels, data } = generarDatosBarras();
  if (!labels.length) return; // Sin datos

  new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Productos comprados por día",
        data,
        backgroundColor: "rgba(76, 175, 80, 0.7)",
        borderColor: "#4caf50",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      // Mantener la relación de aspecto para no expandir en vertical
      maintainAspectRatio: true,
      aspectRatio: 2, // Ajusta la proporción ancho:alto
      scales: {
        x: {
          ticks: { color: "#fff" },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#fff" },
          grid: { color: "#555" }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: "#fff"
          }
        }
      }
    }
  });
}

// Gráfica de línea/montaña con Chart.js
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
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      scales: {
        x: {
          ticks: { color: "#fff" },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#fff" },
          grid: { color: "#555" }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: "#fff"
          }
        }
      }
    }
  });
}

/* Exportamos todas las funciones que usaremos en HTML */
export {
  // CRUD
  crearCompra,
  actualizarCompra,
  eliminarCompra,
  obtenerCompras,
  // Tabla
  renderizarTablaCompras,
  // Widgets
  totalProductosComprados,
  totalInvertidoGeneral,
  // Gráficas
  dibujarGraficaBarrasChartJS,
  dibujarGraficaLineaChartJS
};



