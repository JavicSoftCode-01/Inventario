// Importamos las funciones de CRUD
import {
  crearCompra,
  eliminarCompra,
  actualizarCompra,
  obtenerCompras
} from "../../../BackEnd/services/comprasServices.js";

// Importamos la tabla dinámica
import {
  renderizarTablaCompras,
  renderizarTablaComprasConDatos
} from "../../../BackEnd/services/dinamicTable.js";

// Importamos los widgets y gráficas
import {
  totalProductosComprados,
  totalInvertidoGeneral,
  dibujarGraficaBarrasChartJS,
  dibujarGraficaLineaChartJS
} from "../../../BackEnd/services/widgetsGraphs.js";

// Importamos las utilidades de notificaciones, modales y filtros
import { showNotification } from "./utils/showNotifications.js";
import {
  showConfirmModal,
  showDetallesModal,
  cerrarDetallesModal
} from "./utils/modal.js";
import {
  filtrarComprasPorQuery,
  filtrarComprasPorTotal
} from "./utils/searchFilters.js";

// Aquí va tu código de inicialización de la página
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("compras-tbody");
  const form = document.getElementById("form-inventario");
  const modal = document.getElementById("modal-inventario");
  const modalTitulo = document.getElementById("modal-titulo");
  const searchInput = document.getElementById("search-input");

  // Botones
  const btnAbrirModal = document.getElementById("btn-abrir-modal");
  const btnCerrarModal = document.getElementById("modal-cerrar");
  const btnFilterHigh = document.getElementById("btn-filter-high");
  const btnFilterLow = document.getElementById("btn-filter-low");
  const btnRefresh = document.getElementById("btn-refresh");

  // Inputs
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

  // Render inicial de la tabla
  if (tbody) renderizarTablaCompras("compras-tbody");

  // Manejo de abrir/cerrar modal principal
  function abrirModal() {
    if (modal) modal.style.display = "block";
  }

  function cerrarModal() {
    if (modal) modal.style.display = "none";
  }

  // Recalcular total al cambiar precio o cantidad
  function recalcularTotal() {
    const precio = parseFloat(inputPrecio?.value) || 0;
    const cantidad = parseFloat(inputCantidad?.value) || 0;
    if (inputTotal) inputTotal.value = (precio * cantidad).toFixed(2);
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

  inputPrecio?.addEventListener("input", recalcularTotal);
  inputCantidad?.addEventListener("input", recalcularTotal);

  // Evento submit del formulario
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
      // Actualizar
      actualizarCompra(+hiddenId, datos);
      showNotification("¡Actualizado! El registro se actualizó con éxito", "success");
    } else {
      // Crear
      crearCompra(datos);
      showNotification("¡Creado! El registro se creó con éxito", "success");
    }
    form.reset();
    if (inputId) inputId.value = "";
    if (inputTotal) inputTotal.value = "";
    renderizarTablaCompras("compras-tbody");
  });

  // Búsqueda
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim();
      if (query === "") {
        renderizarTablaCompras("compras-tbody");
      } else {
        const compras = obtenerCompras();
        const filtradas = filtrarComprasPorQuery(compras, query);
        renderizarTablaComprasConDatos(filtradas);
      }
    });
  }

  // Filtros de max/min
  if (btnFilterHigh) {
    btnFilterHigh.addEventListener("click", () => {
      const compras = obtenerCompras();
      const filtradas = filtrarComprasPorTotal(compras, "max");
      renderizarTablaComprasConDatos(filtradas);
    });
  }
  if (btnFilterLow) {
    btnFilterLow.addEventListener("click", () => {
      const compras = obtenerCompras();
      const filtradas = filtrarComprasPorTotal(compras, "min");
      renderizarTablaComprasConDatos(filtradas);
    });
  }
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      renderizarTablaCompras("compras-tbody");
    });
  }

  // Evento click en la tabla (detectar botones editar/eliminar/detalles)
  tbody?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = +btn.dataset.id;

    // Eliminar
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
        () => { }
      );

      // Editar
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

      // Detalles
    } else if (btn.classList.contains("btn-detalles")) {
      const compra = obtenerCompras().find((c) => c.id === id);
      if (!compra) return;
      const compras = obtenerCompras();
      const rowIndex = compras.findIndex((c) => c.id === id) + 1;
      showDetallesModal(compra, rowIndex);
    }
  });

  // Widgets
  const spanTotalProductos = document.getElementById("widget-total-productos");
  const spanTotalInvertido = document.getElementById("widget-total-capital");
  if (spanTotalProductos) {
    spanTotalProductos.textContent = totalProductosComprados();
  }
  if (spanTotalInvertido) {
    spanTotalInvertido.textContent = totalInvertidoGeneral().toFixed(2);
  }

  // Dibujar gráficas
  dibujarGraficaBarrasChartJS("chart-barras");
  dibujarGraficaLineaChartJS("chart-linea");

  // Cerrar modal de detalles
  const btnCerrarDetalles = document.getElementById("modal-detalles-cerrar");
  if (btnCerrarDetalles) {
    btnCerrarDetalles.addEventListener("click", cerrarDetallesModal);
  }
});
