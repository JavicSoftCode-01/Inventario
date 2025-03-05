//// Importamos las funciones de CRUD
//import {
//    crearCompra,
//    eliminarCompra,
//    actualizarCompra,
//    obtenerCompras
//} from "../../../BackEnd/services/comprasServices.js";
//
//// Importamos la tabla dinámica
//import {
//    renderizarTablaCompras,
//    renderizarTablaComprasConDatos
//} from "../../../BackEnd/services/dinamicTable.js";
//
//// Importamos los widgets y gráficas
//import {
//    totalProductosComprados,
//    totalInvertidoGeneral,
//    dibujarGraficaBarrasChartJS,
//    dibujarGraficaLineaChartJS
//} from "../../../BackEnd/services/widgetsGraphs.js";
//
//// Importamos las utilidades de notificaciones, modales y filtros
//import {showNotification} from "./utils/showNotifications.js";
//import {
//    showConfirmModal,
//    showDetallesModal,
//    cerrarDetallesModal
//} from "./utils/modal.js";
//import {
//    filtrarComprasPorQuery,
//    filtrarComprasPorTotal
//} from "./utils/searchFilters.js";
//
//import {verificarAutenticacion, actualizarUISegunSesion} from "../../../BackEnd/services/authService.js";
//
//import {cerrarSesion} from "../../../BackEnd/services/usuarioServices.js";
//
//// Aquí va tu código de inicialización de la página
//document.addEventListener("DOMContentLoaded", () => {
//    verificarAutenticacion();
//    actualizarUISegunSesion();
//    const tbody = document.getElementById("compras-tbody");
//    const form = document.getElementById("form-inventario");
//    const modal = document.getElementById("modal-inventario");
//    const modalTitulo = document.getElementById("modal-titulo");
//    const searchInput = document.getElementById("search-input");
//
//    // Botones
//    const btnAbrirModal = document.getElementById("btn-abrir-modal");
//    const btnCerrarModal = document.getElementById("modal-cerrar");
//    const btnFilterHigh = document.getElementById("btn-filter-high");
//    const btnFilterLow = document.getElementById("btn-filter-low");
//    const btnRefresh = document.getElementById("btn-refresh");
//
//    // Inputs
//    const inputId = document.getElementById("compra-id");
//    const inputProveedor = document.getElementById("prov-proveedor");
//    const inputCiudad = document.getElementById("prov-ciudad");
//    const inputTelefono = document.getElementById("prov-telefono");
//    const inputCorreo = document.getElementById("prov-correo");
//    const inputProducto = document.getElementById("prov-producto");
//    const inputPrecio = document.getElementById("prov-precio");
//    const inputCantidad = document.getElementById("prov-cantidad");
//    const inputTotal = document.getElementById("prov-total");
//    const inputAutoriza = document.getElementById("prov-autoriza");
//    const inputPrecioVentaPublico = document.getElementById("prov-precioVentaPublico");
//
//    // Render inicial de la tabla
//    if (tbody) renderizarTablaCompras("compras-tbody");
//
//    // Manejo de abrir/cerrar modal principal
//    function abrirModal() {
//        if (modal) modal.style.display = "block";
//    }
//
//    function cerrarModal() {
//        if (modal) modal.style.display = "none";
//    }
//
//    // Recalcular total al cambiar precio o cantidad
//    function recalcularTotal() {
//        const precio = parseFloat(inputPrecio?.value) || 0;
//        const cantidad = parseFloat(inputCantidad?.value) || 0;
//        if (inputTotal) inputTotal.value = (precio * cantidad).toFixed(2);
//    }
//
//    if (btnAbrirModal) {
//        btnAbrirModal.addEventListener("click", () => {
//            if (modalTitulo) modalTitulo.textContent = "Nueva Compra";
//            form?.reset();
//            if (inputId) inputId.value = "";
//            if (inputTotal) inputTotal.value = "";
//            abrirModal();
//        });
//    }
//    if (btnCerrarModal) btnCerrarModal.addEventListener("click", cerrarModal);
//    window.addEventListener("click", (e) => {
//        if (e.target === modal) cerrarModal();
//    });
//
//    inputPrecio?.addEventListener("input", recalcularTotal);
//    inputCantidad?.addEventListener("input", recalcularTotal);
//
//    // Evento submit del formulario
//    form?.addEventListener("submit", (e) => {
//        e.preventDefault();
//        const hiddenId = inputId?.value.trim();
//        const datos = {
//            proveedor: inputProveedor?.value,
//            ciudad: inputCiudad?.value,
//            telefono: inputTelefono?.value,
//            correo: inputCorreo?.value,
//            producto: inputProducto?.value,
//            precioProducto: inputPrecio?.value,
//            cantidad: inputCantidad?.value,
//            precioVentaPublico: inputPrecioVentaPublico?.value
//        };
//        cerrarModal();
//        try {
//            if (hiddenId) {
//                // Actualizar
//                actualizarCompra(+hiddenId, datos);
//                const messageUpdate = `¡Actualizado! El registro del proveedor "${datos.proveedor}" fue actualizado.`;
//                showNotification(messageUpdate, "success");
//            } else {
//                // Crear
//                crearCompra(datos);
//                const messageCreate = `¡Creado! El registro del proveedor "${datos.proveedor}" fue Creado.`;
//                showNotification(messageCreate, "success");
//            }
//            cerrarModal();
//            form.reset();
//            renderizarTablaCompras("compras-tbody");
//        } catch (error) {
//            showNotification(error.message, "error");
//        }
//    });
//
//    // Búsqueda
//    if (searchInput) {
//        searchInput.addEventListener("input", () => {
//            const query = searchInput.value.trim();
//            if (query === "") {
//                renderizarTablaCompras("compras-tbody");
//            } else {
//                const compras = obtenerCompras();
//                const filtradas = filtrarComprasPorQuery(compras, query);
//                renderizarTablaComprasConDatos(filtradas);
//            }
//        });
//    }
//
//    // Filtros de max/min
//    if (btnFilterHigh) {
//        btnFilterHigh.addEventListener("click", () => {
//            const compras = obtenerCompras();
//            const filtradas = filtrarComprasPorTotal(compras, "max");
//            renderizarTablaComprasConDatos(filtradas);
//        });
//    }
//    if (btnFilterLow) {
//        btnFilterLow.addEventListener("click", () => {
//            const compras = obtenerCompras();
//            const filtradas = filtrarComprasPorTotal(compras, "min");
//            renderizarTablaComprasConDatos(filtradas);
//        });
//    }
//    if (btnRefresh) {
//        btnRefresh.addEventListener("click", () => {
//            if (searchInput) searchInput.value = "";
//            renderizarTablaCompras("compras-tbody");
//        });
//    }
//
//    // Evento click en la tabla (detectar botones editar/eliminar/detalles)
//    tbody?.addEventListener("click", (e) => {
//        const btn = e.target.closest("button");
//        if (!btn) return;
//        const id = +btn.dataset.id;
//
//        // Eliminar
//        if (btn.classList.contains("btn-eliminar")) {
//            const compra = obtenerCompras().find((c) => c.id === id);
//            if (!compra) return;
//            const compras = obtenerCompras();
//            const rowIndex = compras.findIndex((c) => c.id === id) + 1;
//            const message = `Está a punto de eliminar la fila #${rowIndex} del proveedor "${compra.proveedor}", compra autorizada por ${compra.autorizador}. Esta acción es irreversible. ¿Desea proceder con la eliminación?`;
//            const messageDelete = `¡Eliminado! El registro del proveedor "${compra.proveedor}" fue eliminado.`;
//
//            showConfirmModal(
//                message,
//                () => {
//                    eliminarCompra(id);
//                    renderizarTablaCompras("compras-tbody");
//                    showNotification(messageDelete, "success");
//                },
//                () => {
//                }
//            );
//
//            // Editar
//        } else if (btn.classList.contains("btn-editar")) {
//            const compra = obtenerCompras().find((c) => c.id === id);
//            const messageUpdate = `¡Actualizado! El registro del proveedor "${compra.proveedor}" fue actualizado.`;
//            if (!compra) return;
//            if (modalTitulo) modalTitulo.textContent = "Editar Compra";
//            if (inputId) inputId.value = compra.id;
//            if (inputProveedor) inputProveedor.value = compra.proveedor;
//            if (inputCiudad) inputCiudad.value = compra.ciudad;
//            if (inputTelefono) inputTelefono.value = compra.telefono;
//            if (inputCorreo) inputCorreo.value = compra.correo;
//            if (inputProducto) inputProducto.value = compra.producto;
//            if (inputPrecio) inputPrecio.value = compra.precioProducto;
//            if (inputCantidad) inputCantidad.value = compra.cantidad;
//            if (inputPrecioVentaPublico) inputPrecioVentaPublico.value = compra.precioVentaPublico;
//            recalcularTotal();
//            abrirModal();
//
//            // Detalles
//        } else if (btn.classList.contains("btn-detalles")) {
//            const compra = obtenerCompras().find((c) => c.id === id);
//            if (!compra) return;
//            const compras = obtenerCompras();
//            const rowIndex = compras.findIndex((c) => c.id === id) + 1;
//            showDetallesModal(compra, rowIndex);
//        }
//    });
//
//    // Widgets
//    const spanTotalProductos = document.getElementById("widget-total-productos");
//    const spanTotalInvertido = document.getElementById("widget-total-capital");
//    if (spanTotalProductos) {
//        spanTotalProductos.textContent = totalProductosComprados();
//    }
//    if (spanTotalInvertido) {
//        spanTotalInvertido.textContent = totalInvertidoGeneral().toFixed(2);
//    }
//
//    // Dibujar gráficas
//    dibujarGraficaBarrasChartJS("chart-barras");
//    dibujarGraficaLineaChartJS("chart-linea");
//
//    // Cerrar modal de detalles
//    const btnCerrarDetalles = document.getElementById("modal-detalles-cerrar");
//    if (btnCerrarDetalles) {
//        btnCerrarDetalles.addEventListener("click", cerrarDetallesModal);
//    }
//
//    const btnLogout = document.getElementById("btn-logout");
//    if (btnLogout) {
//        btnLogout.addEventListener("click", (e) => {
//            e.preventDefault();
//            cerrarSesion();
//        });
//    }
//});
//

import { PurchaseService } from "../../../BackEnd/services/comprasServices.js";
import { DynamicTable } from "../../../BackEnd/services/dinamicTable.js";
import { WidgetsGraphs } from "../../../BackEnd/services/widgetsGraphs.js";
import { NotificationManager } from "./utils/showNotifications.js";
import { modalManager } from "./utils/modal.js";
import { PurchaseManager } from "./utils/searchFilters.js";
import { AuthService } from "../../../BackEnd/services/authService.js";
import { UserManager } from "../../../BackEnd/services/usuarioServices.js";

/**
 * Clase principal para manejar la aplicación de inventario
 */
class InventoryApp {
  constructor() {
    // Servicios
    this.purchaseService = new PurchaseService();
    this.notificationManager = new NotificationManager();
    this.authService = new AuthService();

    // Elementos del DOM
    this.initializeElements();

    // Manejadores de eventos
    this.setupEventListeners();
  }

  /**
   * Inicializa todos los elementos del DOM necesarios
   */
  initializeElements() {
    // Elementos principales
    this.tbody = document.getElementById("compras-tbody");
    this.form = document.getElementById("form-inventario");
    this.modal = document.getElementById("modal-inventario");
    this.modalTitle = document.getElementById("modal-titulo");
    this.searchInput = document.getElementById("search-input");
    this.usuarioLogueado = document.getElementById("usuario-logueado");


    // Botones
    this.openModalBtn = document.getElementById("btn-abrir-modal");
    this.closeModalFormBtn = document.getElementById("modal-cerrar-form");
    this.closeModalBtn = document.getElementById("modal-detalles-cerrar");
    this.filterHighBtn = document.getElementById("btn-filter-high");
    this.filterLowBtn = document.getElementById("btn-filter-low");
    this.refreshBtn = document.getElementById("btn-refresh");
    this.logoutBtn = document.getElementById("btn-logout");

    // Campos del formulario
    this.initializeFormFields();
  }

  /**
   * Inicializa los campos del formulario
   */
  initializeFormFields() {
    this.formFields = {
      id: document.getElementById("compra-id"),
      proveedor: document.getElementById("prov-proveedor"),
      ciudad: document.getElementById("prov-ciudad"),
      telefono: document.getElementById("prov-telefono"),
      correo: document.getElementById("prov-correo"),
      producto: document.getElementById("prov-producto"),
      precio: document.getElementById("prov-precio"),
      cantidad: document.getElementById("prov-cantidad"),
      total: document.getElementById("prov-total"),
      autoriza: document.getElementById("prov-autoriza"),
      precioVentaPublico: document.getElementById("prov-precioVentaPublico")
    };
  }

  /**
   * Configura todos los event listeners
   */
  setupEventListeners() {
    // Event listeners para el formulario
    this.form?.addEventListener("submit", (e) => this.handleFormSubmit(e));
    this.formFields.precio?.addEventListener("input", () => this.recalculateTotal());
    this.formFields.cantidad?.addEventListener("input", () => this.recalculateTotal());

    // Event listeners para los botones
    this.setupButtonListeners();

    // Event listener para búsqueda
    this.setupSearchListener();

    // Event listener para la tabla
    this.setupTableListener();
  }

  /**
   * Configura los event listeners de los botones
   */
  setupButtonListeners() {
    this.openModalBtn?.addEventListener("click", () => this.handleOpenModal());
    this.closeModalFormBtn?.addEventListener("click", () => this.closeModalForm());
    this.closeModalBtn?.addEventListener("click", () => modalManager.closeDetailsModal());
    this.filterHighBtn?.addEventListener("click", () => this.handleFilter("max"));
    this.filterLowBtn?.addEventListener("click", () => this.handleFilter("min"));
    this.refreshBtn?.addEventListener("click", () => this.handleRefresh());
    this.logoutBtn?.addEventListener("click", (e) => this.handleLogout(e));
  }

  /**
   * Maneja el envío del formulario
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    try {
      const formData = this.getFormData();
      const hiddenId = this.formFields.id?.value.trim();

      this.closeModalForm();

      if (hiddenId) {
        await this.handleUpdate(hiddenId, formData);
      } else {
        await this.handleCreate(formData);
      }

      this.form?.reset();
      DynamicTable.renderTable("compras-tbody");
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      this.notificationManager.showNotification(
        "Error al procesar el formulario", 
        "error"
      );
    }
  }

  /**
   * Obtiene los datos del formulario
   */
  getFormData() {
    return {
      proveedor: this.formFields.proveedor?.value,
      ciudad: this.formFields.ciudad?.value,
      telefono: this.formFields.telefono?.value,
      correo: this.formFields.correo?.value,
      producto: this.formFields.producto?.value,
      precioProducto: this.formFields.precio?.value,
      cantidad: this.formFields.cantidad?.value,
      precioVentaPublico: this.formFields.precioVentaPublico?.value
    };
  }

  /**
   * Maneja la creación de una nueva compra
   */
  async handleCreate(formData) {
    const result = await PurchaseService.createPurchase(formData);
    if (result.success) {
      this.notificationManager.showNotification(
        `¡Creado! El registro del proveedor "${formData.proveedor}" fue creado`,
        "success"
      );
    } else {
      this.notificationManager.showNotification(result.message, "error");
    }
  }

  /**
   * Maneja la actualización de una compra
   */
  async handleUpdate(id, formData) {
    const result = await PurchaseService.updatePurchase(Number(id), formData);
    if (result.success) {
      this.notificationManager.showNotification(
        `¡Actualizado! El registro del proveedor "${formData.proveedor}" fue actualizado`,
        "success"
      );
    } else {
      this.notificationManager.showNotification(result.message, "error");
    }
  }

  /**
   * Recalcula el total en el formulario
   */
  recalculateTotal() {
    const precio = parseFloat(this.formFields.precio?.value) || 0;
    const cantidad = parseFloat(this.formFields.cantidad?.value) || 0;
    if (this.formFields.total) {
      this.formFields.total.value = (precio * cantidad).toFixed(2);
    }
  }

  /**
   * Configura el listener de búsqueda
   */
  setupSearchListener() {
    this.searchInput?.addEventListener("input", () => {
      const query = this.searchInput.value.trim();
      if (query === "") {
        DynamicTable.renderTable("compras-tbody");
      } else {
        const purchases = PurchaseService.getPurchases();
        const filtered = PurchaseManager.filterPurchasesByQuery(purchases, query);
        DynamicTable.renderTableWithData(filtered);
      }
    });
  }

  /**
   * Maneja los eventos de la tabla
   */
  setupTableListener() {
    this.tbody?.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const id = Number(btn.dataset.id);
      if (btn.classList.contains("btn-eliminar")) {
        this.handleDelete(id);
      } else if (btn.classList.contains("btn-editar")) {
        this.handleEdit(id);
      } else if (btn.classList.contains("btn-detalles")) {
        this.handleDetails(id);
      }
    });
  }

  /**
   * Maneja la eliminación de una compra
   */
  handleDelete(id) {
    const purchases = PurchaseService.getPurchases();
    const purchase = purchases.find(p => p.id === id);
    if (!purchase) return;

    const rowIndex = purchases.findIndex(p => p.id === id) + 1;
    const message = `¿Está seguro de eliminar la fila #${rowIndex} del proveedor "${purchase.proveedor}"  --  Compra Autorizada por "${UserManager.getCurrentUserFullName()}"?`;

    modalManager.showConfirmModal(
      message,
      async () => {
        const result = await PurchaseService.deletePurchase(id);
        if (result.success) {
          this.notificationManager.showNotification(
            `El registro del proveedor "${purchase.proveedor}" fue eliminado`,
            "success"
          );
          DynamicTable.renderTable("compras-tbody");
        } else {
          this.notificationManager.showNotification(result.message, "error");
        }
      }
    );
  }

  /**
   * Maneja la edición de una compra
   */
  //handleEdit(id) {
  //  const purchases = PurchaseService.getPurchases();
  //  const purchase = purchases.find(p => p.id === id);
  //  if (!purchase) return;
//
  //  this.modalTitle.textContent = "Editar Compra";
  //  Object.entries(purchase).forEach(([key, value]) => {
  //    if (this.formFields[key]) {
  //      this.formFields[key].value = value;
  //    }
  //  });
  //  this.recalculateTotal();
  //  this.openModal();
  //}
  handleEdit(id) {
    const purchases = PurchaseService.getPurchases();
    const purchase = purchases.find(p => p.id === id);
    if (!purchase) return;

    this.modalTitle.textContent = "Editar Compra";
    
    // Mapeo personalizado de campos
    const fieldMapping = {
        id: 'id',
        proveedor: 'proveedor',
        ciudad: 'ciudad',
        telefono: 'telefono',
        correo: 'correo',
        producto: 'producto',
        precioProducto: 'precio', // Aquí está la corrección
        cantidad: 'cantidad',
        precioVentaPublico: 'precioVentaPublico'
    };

    // Actualizar campos usando el mapeo
    Object.entries(fieldMapping).forEach(([purchaseKey, formKey]) => {
        if (this.formFields[formKey]) {
            this.formFields[formKey].value = purchase[purchaseKey] || '';
        }
    });

    this.recalculateTotal();
    this.openModal();
}

  /**
   * Maneja la visualización de detalles
   */
  handleDetails(id) {
    const purchases = PurchaseService.getPurchases();
    const purchase = purchases.find(p => p.id === id);
    if (!purchase) return;

    const rowIndex = purchases.findIndex(p => p.id === id) + 1;
    modalManager.showDetailsModal(purchase, rowIndex);
  }

  /**
   * Métodos auxiliares para el modal
   */
  handleOpenModal() {
    if (this.modalTitle) this.modalTitle.textContent = "Nueva Compra";
    this.form?.reset();
    if (this.formFields.id) this.formFields.id.value = "";
    if (this.formFields.total) this.formFields.total.value = "";
    this.openModal();
  }

  openModal() {
    if (this.modal) this.modal.style.display = "block";
  }

  /**
   * Cerrar modal del formulario
   */
  closeModalForm() {
    if (this.modal) this.modal.style.display = "none";
  }

  /**
   * Maneja el filtrado de compras
   */
  handleFilter(order) {
    const purchases = PurchaseService.getPurchases();
    const filtered = PurchaseManager.filterPurchasesByTotal(purchases, order);
    DynamicTable.renderTableWithData(filtered);
  }

  /**
   * Maneja el refresco de la tabla
   */
  handleRefresh() {
    if (this.searchInput) this.searchInput.value = "";
    DynamicTable.renderTable("compras-tbody");
  }

  /**
   * Maneja el cierre de sesión
   */
  handleLogout(e) {
    e.preventDefault();
    UserManager.logout();
  }

  /**
   * Inicializa los widgets y gráficas
   */
  //initializeWidgets() {
  //  try {
  //    // Actualizar widgets de texto
  //    const totalProducts = document.getElementById("widget-total-productos");
  //    const totalInvested = document.getElementById("widget-total-capital");
//
  //    if (totalProducts) {
  //      totalProducts.textContent = WidgetsGraphs.totalProductsPurchased();
  //    }
  //    if (totalInvested) {
  //      totalInvested.textContent = WidgetsGraphs.totalInvestedGeneral().toFixed(2);
  //    }
//
  //    // Esperar a que el DOM esté completamente cargado antes de inicializar las gráficas
  //    setTimeout(() => {
  //      WidgetsGraphs.drawBarChart("chart-barras");
  //      WidgetsGraphs.drawLineChart("chart-linea");
  //    }, 100);
  //  } catch (error) {
  //    console.error("Error al inicializar widgets:", error);
  //  }
  //}
  initializeWidgets() {
    try {
      // Actualizar widgets de texto
      const totalProducts = document.getElementById("widget-total-productos");
      const totalInvested = document.getElementById("widget-total-capital");
  
      if (totalProducts) {
        totalProducts.textContent = WidgetsGraphs.totalProductsPurchased();
      }
      if (totalInvested) {
        totalInvested.textContent = WidgetsGraphs.totalInvestedGeneral().toFixed(2);
      }
  
      // Verificar si los canvas existen antes de inicializar las gráficas
      const chartBarras = document.getElementById("chart-barras");
      const chartLinea = document.getElementById("chart-linea");
  
      if (chartBarras && chartLinea) {
        // Esperar a que el DOM esté completamente cargado antes de inicializar las gráficas
        setTimeout(() => {
          WidgetsGraphs.drawBarChart("chart-barras");
          WidgetsGraphs.drawLineChart("chart-linea");
        }, 100);
      }
    } catch (error) {
      console.error("Error al inicializar widgets:", error);
    }
  }

  /**
   * Inicializa la aplicación
   */
  // Añadir en el método init() de la clase InventoryApp
//init() {
//  // Verificar autenticación
//  this.authService.verifyAuthentication();
//  this.authService.updateUIForSession();
//
//  // Debug: Mostrar información de la sesión actual
//  const currentSession = UserManager.getCurrentSession();
//  console.log('Sesión actual:', currentSession);
//
//  // Renderizar tabla inicial
//  if (this.tbody) {
//    DynamicTable.renderTable("compras-tbody");
//  }
//
//  // Inicializar widgets y gráficas
//  this.initializeWidgets();
//}
init() {
  // Verificar autenticación
  this.authService.verifyAuthentication();
  this.authService.updateUIForSession();

  // Renderizar tabla inicial si estamos en la página de inventario
  if (this.tbody) {
    DynamicTable.renderTable("compras-tbody");
  }

  // Inicializar widgets y gráficas solo si estamos en index.html
  if (window.location.pathname.includes('index.html')) {
    this.initializeWidgets();
  }
  // El nombre del usuario logueado
  this.usuarioLogueado.textContent = UserManager.getCurrentUserFullName();
}
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const app = new InventoryApp();
  app.init();
});