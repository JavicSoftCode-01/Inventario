import { AuthFormManager } from "./utils/authForm.js";
import { AuthManager } from "../../../../BackEnd/services/authServices.js";
import { ExecuteManager } from "../../../../BackEnd/utils/execute.js";
import { Validations } from "./utils/validations.js";

class RegisterManager extends AuthFormManager {
    constructor() {
        super("registro-form", "contrasena");
        this.inputFields = {
            nombres: document.getElementById("nombres"),
            apellidos: document.getElementById("apellidos"),
            fechaNacimiento: document.getElementById("fechaNacimiento"),
            telefono: document.getElementById("telefono"),
            nombreUsuario: document.getElementById("nombreUsuario"),
            contrasena: this.passwordInput,
            confirmarContrasena: document.getElementById("confirmarContrasena")
        };
        this.setupPasswordToggles();
    }

    setupPasswordToggles() {
        return ExecuteManager.execute(() => {
            document.querySelectorAll(".toggle-password").forEach(button => {
                button.addEventListener("click", () => this.togglePasswordVisibility(button));
            });
        }, "Éxito! Configuración de botones de contraseña completada.", "Error! Al configurar botones de contraseña:");
    }

    async handleFormSubmit() {
        return ExecuteManager.execute(async () => {
            const formData = this.validateRequiredFields(this.inputFields);
            if (!formData) return;

            if (!Validations.passwords(formData.contrasena, formData.confirmarContrasena)) return;
            if (!Validations.age(formData.fechaNacimiento)) return;

            await AuthManager.register(formData);
            
            setTimeout(() => {
                AuthManager.redirectTo(AuthManager._LOGIN_PATH);
            }, 1500);
        }, "Éxito! Registro completado.", "Error! En el proceso de registro:");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const registerManager = new RegisterManager();
    registerManager.init();
});