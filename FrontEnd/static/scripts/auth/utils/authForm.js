import { AuthManager } from "../../../../../BackEnd/services/authServices.js";
import { NotificationManager } from "../../../scripts/utils/showNotifications.js";
import { ExecuteManager } from "../../../../../BackEnd/utils/execute.js";

class AuthFormManager {
    constructor(formId, passwordInputId) {
        this.form = document.getElementById(formId);
        this.passwordInput = document.getElementById(passwordInputId);
        this.passwordToggleButton = document.querySelector(".toggle-password");
    }

    init() {
        return ExecuteManager.execute(() => {
            AuthManager.verifyAuthentication();
            this.setupEvents();
        }, "Éxito! Formulario de autenticación inicializado.", "Error! Al inicializar el formulario de autenticación:");
    }

    setupEvents() {
        return ExecuteManager.execute(() => {
            if (this.form) {
                this.form.addEventListener("submit", (e) => {
                    e.preventDefault();
                    this.handleFormSubmit();
                });
            }

            if (this.passwordToggleButton) {
                this.passwordToggleButton.addEventListener("click", () => 
                    this.togglePasswordVisibility());
            }
        }, "Éxito! Eventos configurados correctamente.", "Error! Al configurar eventos:");
    }

    togglePasswordVisibility() {
        return ExecuteManager.execute(() => {
            if (!this.passwordInput) return;

            const newType = this.passwordInput.type === "password" ? "text" : "password";
            this.passwordInput.type = newType;

            const icon = this.passwordToggleButton.querySelector("i");
            icon.classList.toggle("fa-eye");
            icon.classList.toggle("fa-eye-slash");
        }, "Éxito! Visibilidad de la contraseña cambiada.", "Error! Al cambiar visibilidad de la contraseña:");
    }

    validateRequiredFields(fields) {
        return ExecuteManager.execute(() => {
            const values = Object.entries(fields).reduce((acc, [key, element]) => {
                acc[key] = element?.value?.trim() ?? "";
                return acc;
            }, {});

            if (Object.values(values).some(value => !value)) {
                NotificationManager.warning("¡Atención! Todos los campos son requeridos");
                return null;
            }

            return values;
        }, "Éxito! Campos validados.", "Error! Al validar campos:");
    }

    // Abstract method to be implemented by child classes
    async handleFormSubmit() {
        throw new Error("handleFormSubmit debe ser implementado por las clases hijas");
    }
}

export { AuthFormManager };