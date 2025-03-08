import {PurchaseService} from "../../../BackEnd/services/purchaseService.js";
import {DynamicTable} from "./utils/dinamicTable.js";
import {WidgetsGraphs} from "./utils/widgetsGraphs.js";
import {ModalManager} from "./utils/modal.js";
import {PurchaseManager} from "./utils/searchFilters.js";
import {AuthManager} from "../../../BackEnd/services/authServices.js";
import {ExecuteManager} from "../../../BackEnd/utils/execute.js";

class InventoryApp {
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    return ExecuteManager.execute(() => {
      this.elements = {
        tbody: document.getElementById("compras-tbody"),
        form: document.getElementById("form-inventario"),
        modal: document.getElementById("modal-inventario"),
        modalTitle: document.getElementById("modal-titulo"),
        searchInput: document.getElementById("search-input"),
        userDisplay: document.getElementById("usuario-logueado"),
        buttons: this.initializeButtons(),
        formFields: this.initializeFormFields()
      };
    }, "Elements initialized", "Error initializing elements:");
  }

  initializeButtons() {
    return {
      openModal: document.getElementById("btn-abrir-modal"),
      closeModalForm: document.getElementById("modal-cerrar-form"),
      closeModal: document.getElementById("modal-detalles-cerrar"),
      filterHigh: document.getElementById("btn-filter-high"),
      filterLow: document.getElementById("btn-filter-low"),
      refresh: document.getElementById("btn-refresh"),
      logout: document.getElementById("btn-logout")
    };
  }

  initializeFormFields() {
    return {
      id: document.getElementById("compra-id"),
      proveedor: document.getElementById("prov-proveedor"),
      ciudad: document.getElementById("prov-ciudad"),
      telefono: document.getElementById("prov-telefono"),
      correo: document.getElementById("prov-correo"),
      producto: document.getElementById("prov-producto"),
      precio: document.getElementById("prov-precio"),
      cantidad: document.getElementById("prov-cantidad"),
      total: document.getElementById("prov-total"),
      precioVentaPublico: document.getElementById("prov-precioVentaPublico")
    };
  }

  setupEventListeners() {
    return ExecuteManager.execute(() => {
      this.setupFormListeners();
      this.setupButtonListeners();
      this.setupSearchListener();
      this.setupTableListener();
    }, "Event listeners setup complete", "Error setting up event listeners:");
  }

  setupFormListeners() {
    const {form, formFields} = this.elements;
    form?.addEventListener("submit", (e) => this.handleFormSubmit(e));
    formFields.precio?.addEventListener("input", () => this.recalculateTotal());
    formFields.cantidad?.addEventListener("input", () => this.recalculateTotal());
  }

  setupButtonListeners() {
    const {buttons} = this.elements;
    const buttonActions = {
      openModal: () => this.handleOpenModal(),
      closeModalForm: () => this.closeModalForm(),
      closeModal: () => ModalManager.closeDetails(),
      filterHigh: () => this.handleFilter("max"),
      filterLow: () => this.handleFilter("min"),
      refresh: () => this.handleRefresh(),
      logout: (e) => this.handleLogout(e)
    };

    Object.entries(buttons).forEach(([key, button]) => {
      button?.addEventListener("click", buttonActions[key]);
    });
  }

  async handleFormSubmit(e) {
    return ExecuteManager.execute(async () => {
      e.preventDefault();
      const formData = this.getFormData();
      const hiddenId = this.elements.formFields.id?.value.trim();

      this.closeModalForm();

      if (hiddenId) {
        await PurchaseService.updatePurchase(hiddenId, formData);
      } else {
        await PurchaseService.createPurchase(formData);
      }

      this.elements.form?.reset();
      DynamicTable.renderTable("compras-tbody");
    }, "Form submitted successfully", "Error submitting form:");
  }

  getFormData() {
    const {formFields} = this.elements;
    return {
      proveedor: formFields.proveedor?.value,
      ciudad: formFields.ciudad?.value,
      telefono: formFields.telefono?.value,
      correo: formFields.correo?.value,
      producto: formFields.producto?.value,
      precioProducto: formFields.precio?.value,
      cantidad: formFields.cantidad?.value,
      precioVentaPublico: formFields.precioVentaPublico?.value
    };
  }

  recalculateTotal() {
    return ExecuteManager.execute(() => {
      const {formFields} = this.elements;
      const precio = parseFloat(formFields.precio?.value) || 0;
      const cantidad = parseFloat(formFields.cantidad?.value) || 0;
      if (formFields.total) {
        formFields.total.value = (precio * cantidad).toFixed(2);
      }
    }, "Total recalculated", "Error recalculating total:");
  }

  setupSearchListener() {
    const {searchInput} = this.elements;
    searchInput?.addEventListener("input", () => {
      const query = searchInput.value.trim();
      const purchases = PurchaseService.getPurchases();
      const filtered = query ? PurchaseManager.search(purchases, query) : purchases;
      DynamicTable.renderTableWithData(filtered);
    });
  }

  setupTableListener() {
    const {tbody} = this.elements;
    tbody?.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const id = Number(btn.dataset.id);
      const actions = {
        "btn-eliminar": () => this.handleDelete(id),
        "btn-editar": () => this.handleEdit(id),
        "btn-detalles": () => this.handleDetails(id)
      };

      const action = Object.entries(actions).find(([className]) =>
        btn.classList.contains(className)
      );

      if (action) action[1]();
    });
  }

  handleDelete(id) {
    return ExecuteManager.execute(() => {
      const purchase = PurchaseService.getPurchases().find(p => p.id === id);
      if (!purchase) return;

      const message = `¿Está seguro de eliminar la compra del proveedor "${purchase.proveedor}"?`;
      ModalManager.showConfirm(message, async () => {
        await PurchaseService.deletePurchase(id);
        DynamicTable.renderTable("compras-tbody");
      });
    }, "Delete handled successfully", "Error handling delete:");
  }

  handleEdit(id) {
    return ExecuteManager.execute(() => {
      const purchase = PurchaseService.getPurchases().find(p => p.id === id);
      if (!purchase) return;

      const {formFields, modalTitle} = this.elements;
      modalTitle.textContent = "Editar Compra";

      Object.entries(this.getFormFieldMapping()).forEach(([purchaseKey, formKey]) => {
        if (formFields[formKey]) {
          formFields[formKey].value = purchase[purchaseKey] || '';
        }
      });

      this.recalculateTotal();
      this.openModal();
    }, "Edit handled successfully", "Error handling edit:");
  }

  getFormFieldMapping() {
    return {
      id: 'id',
      proveedor: 'proveedor',
      ciudad: 'ciudad',
      telefono: 'telefono',
      correo: 'correo',
      producto: 'producto',
      precioProducto: 'precio',
      cantidad: 'cantidad',
      precioVentaPublico: 'precioVentaPublico'
    };
  }

  handleDetails(id) {
    return ExecuteManager.execute(() => {
      const purchases = PurchaseService.getPurchases();
      const purchase = purchases.find(p => p.id === id);
      if (!purchase) return;

      const rowIndex = purchases.findIndex(p => p.id === id) + 1;
      ModalManager.showDetails(purchase, rowIndex);
    }, "Details handled successfully", "Error handling details:");
  }

  handleOpenModal() {
    return ExecuteManager.execute(() => {
      const {modalTitle, form, formFields} = this.elements;
      modalTitle.textContent = "Nueva Compra";
      form?.reset();
      formFields.id.value = "";
      formFields.total.value = "";
      this.openModal();
    }, "Modal opened successfully", "Error opening modal:");
  }

  openModal() {
    if (this.elements.modal) this.elements.modal.style.display = "block";
  }

  closeModalForm() {
    if (this.elements.modal) this.elements.modal.style.display = "none";
  }

  handleFilter(order) {
    return ExecuteManager.execute(() => {
      const purchases = PurchaseService.getPurchases();
      const filtered = PurchaseManager.filterPurchasesByTotal(purchases, order);
      DynamicTable.renderTableWithData(filtered);
    }, "Filter applied successfully", "Error applying filter:");
  }

  handleRefresh() {
    return ExecuteManager.execute(() => {
      if (this.elements.searchInput) this.elements.searchInput.value = "";
      DynamicTable.renderTable("compras-tbody");
    }, "Table refreshed successfully", "Error refreshing table:");
  }

  handleLogout(e) {
    return ExecuteManager.execute(() => {
      e.preventDefault();
      AuthManager.logout();
    }, "Logout successful", "Error during logout:");
  }

  initializeWidgets() {
    return ExecuteManager.execute(() => {
      const elements = {
        totalProducts: document.getElementById("widget-total-productos"),
        totalInvested: document.getElementById("widget-total-capital"),
        barChart: document.getElementById("chart-barras"),
        lineChart: document.getElementById("chart-linea")
      };

      if (elements.totalProducts) {
        elements.totalProducts.textContent = WidgetsGraphs.totalProductsPurchased();
      }
      if (elements.totalInvested) {
        elements.totalInvested.textContent = WidgetsGraphs.totalInvestedGeneral().toFixed(2);
      }

      if (elements.barChart && elements.lineChart) {
        setTimeout(() => {
          WidgetsGraphs.drawBarChart("chart-barras");
          WidgetsGraphs.drawLineChart("chart-linea");
        }, 100);
      }
    }, "Widgets initialized successfully", "Error initializing widgets:");
  }

  init() {
    return ExecuteManager.execute(() => {
      AuthManager.verifyAuthentication();

      if (this.elements.tbody) {
        DynamicTable.renderTable("compras-tbody");
      }

      if (window.location.pathname.includes('index.html')) {
        this.initializeWidgets();
      }

      if (this.elements.userDisplay) {
        const session = AuthManager.getCurrentSession();
        this.elements.userDisplay.textContent = `${session.nombres} ${session.apellidos}`;
      }
    }, "Application initialized successfully", "Error initializing application:");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new InventoryApp();
  app.init();
});