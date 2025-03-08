import { AuthFormManager } from "./utils/authForm.js";
import { AuthManager } from "../../../../BackEnd/services/authServices.js";
import { ExecuteManager } from "../../../../BackEnd/utils/execute.js";

class LoginManager extends AuthFormManager {
    constructor() {
        super("login-form", "contrasena");
        this.usernameInput = document.getElementById("nombreUsuario");
    }

    async handleFormSubmit() {
        return ExecuteManager.execute(async () => {
            const formData = this.validateRequiredFields({
                username: this.usernameInput,
                password: this.passwordInput
            });
            
            if (!formData) return;
            await AuthManager.login(formData.username, formData.password);
        }, "Éxito! Inicio de sesión completado.", "Error! En el proceso de inicio de sesión:");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loginManager = new LoginManager();
    loginManager.init();
});