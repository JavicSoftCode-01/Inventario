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
          ${porcentaje === "N/A" ? "N/A" : "%" + porcentaje} (${ganancia === "N/A" ? "N/A" : "$" + ganancia})
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

// Función para la gráfica de barras
function dibujarGraficaBarrasChartJS(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Obtenemos datos (fecha -> sum(cantidad))
  const { labels, data } = generarDatosBarras();
  if (!labels.length) {
    return; // No hay datos, no dibujamos nada
  }

  // Creamos el gráfico de barras
  new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Productos comprados por día",
          data: data,
          backgroundColor: "rgba(76, 175, 80, 0.7)", // Verde
          borderColor: "#4caf50",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#fff" },
          grid: { color: "#555" }
        },
        x: {
          ticks: { color: "#fff" },
          grid: { display: false }
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

// Función para la gráfica de línea (montaña)
function dibujarGraficaLineaChartJS(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Obtenemos datos (fecha -> sum(total invertido ese día))
  const { labels, data } = generarDatosLinea();
  if (!labels.length) {
    return; // No hay datos
  }

  new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Dinero Invertido por Día",
          data: data,
          fill: "start", // Para que se pinte como "montaña"
          backgroundColor: "rgba(255, 87, 34, 0.3)", // Naranja tenue
          borderColor: "#FF5722",
          borderWidth: 2,
          tension: 0.3 // Curvatura de la línea
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#fff" },
          grid: { color: "#555" }
        },
        x: {
          ticks: { color: "#fff" },
          grid: { display: false }
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

/*
  Dibujamos gráficas simples con <canvas>.
  Sin librerías externas, haremos un dibujo muy básico.
*/

// Dibuja gráfica de barras
function dibujarGraficaBarras(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  // Limpiamos
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Obtenemos datos
  const { labels, data } = generarDatosBarras();
  if (labels.length === 0) {
    ctx.fillStyle = "#fff";
    ctx.fillText("No hay datos para la gráfica de barras.", 10, 30);
    return;
  }

  // Calculamos escalas
  const maxValor = Math.max(...data);
  const margen = 20;
  const anchoDisponible = canvas.width - 2 * margen;
  const altoDisponible = canvas.height - 2 * margen;
  const barWidth = anchoDisponible / labels.length / 2;

  // Dibujamos ejes (simple)
  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  // Eje X
  ctx.moveTo(margen, canvas.height - margen);
  ctx.lineTo(canvas.width - margen, canvas.height - margen);
  // Eje Y
  ctx.moveTo(margen, canvas.height - margen);
  ctx.lineTo(margen, margen);
  ctx.stroke();

  // Dibujamos barras
  data.forEach((valor, i) => {
    const x = margen + i * (barWidth * 2) + barWidth / 2;
    const altura = (valor / maxValor) * (altoDisponible - 20); // un poco de margen arriba
    const y = canvas.height - margen - altura;

    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(x, y, barWidth, altura);

    // Etiqueta de valor
    ctx.fillStyle = "#fff";
    ctx.fillText(valor, x, y - 5);

    // Etiqueta de fecha
    ctx.fillStyle = "#fff";
    ctx.fillText(labels[i], x, canvas.height - margen + 12);
  });
}

// Dibuja gráfica de línea (tipo montaña)
function dibujarGraficaLinea(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  // Limpiamos
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Obtenemos datos
  const { labels, data } = generarDatosLinea();
  if (labels.length === 0) {
    ctx.fillStyle = "#fff";
    ctx.fillText("No hay datos para la gráfica de línea.", 10, 30);
    return;
  }

  // Calculamos escalas
  const maxValor = Math.max(...data);
  const margen = 20;
  const anchoDisponible = canvas.width - 2 * margen;
  const altoDisponible = canvas.height - 2 * margen;

  // Convertimos índices a coordenadas
  const puntos = data.map((valor, i) => {
    const x = margen + (i / (data.length - 1)) * anchoDisponible;
    const y = canvas.height - margen - (valor / maxValor) * (altoDisponible - 20);
    return { x, y };
  });

  // Ejes
  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  // Eje X
  ctx.moveTo(margen, canvas.height - margen);
  ctx.lineTo(canvas.width - margen, canvas.height - margen);
  // Eje Y
  ctx.moveTo(margen, canvas.height - margen);
  ctx.lineTo(margen, margen);
  ctx.stroke();

  // Dibujamos la línea
  ctx.beginPath();
  ctx.strokeStyle = "#FF5722";
  ctx.fillStyle = "rgba(255, 87, 34, 0.3)"; // relleno tenue
  ctx.moveTo(puntos[0].x, puntos[0].y);

  puntos.forEach((p, i) => {
    ctx.lineTo(p.x, p.y);
  });
  // Cerramos para el relleno "montaña"
  ctx.lineTo(puntos[puntos.length - 1].x, canvas.height - margen);
  ctx.lineTo(puntos[0].x, canvas.height - margen);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Etiquetas de valor
  ctx.fillStyle = "#fff";
  puntos.forEach((p, i) => {
    ctx.fillText(data[i], p.x, p.y - 5);
    // Etiqueta de fecha
    ctx.fillText(labels[i], p.x, canvas.height - margen + 12);
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



