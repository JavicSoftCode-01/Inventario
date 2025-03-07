import {PurchaseService} from "../../../BackEnd/services/comprasServices.js";
import {DynamicTable} from "../../../BackEnd/services/dinamicTable.js";
import {WidgetsGraphs} from "../../../BackEnd/services/widgetsGraphs.js";
import {NotificationManager} from "./utils/showNotifications.js";
import {modalManager} from "./utils/modal.js";
import {PurchaseManager} from "./utils/searchFilters.js";
import {AuthService} from "../../../BackEnd/services/authService.js";
import {UserManager} from "../../../BackEnd/services/usuarioServices.js";

class InventoryApp {
    constructor() {
        // Servicios
        // this.purchaseService = new PurchaseService();
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