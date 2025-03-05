import { UserManager } from "../../../../BackEnd/services/usuarioServices.js";
import { NotificationManager } from "../utils/showNotifications.js";
import { AuthService } from "../../../../BackEnd/services/authService.js";

/**
 * Clase para manejar el inicio de sesión
 */
class LoginManager {
  constructor() {
    this.form = document.getElementById("login-form");
    this.passwordToggleButton = document.querySelector(".toggle-password");
    this.notificationManager = new NotificationManager();
    this.authService = new AuthService();
  }

  
   //Inicializa los manejadores de eventos
  init() {
    // Verifica autenticación al cargar
    this.authService.verifyAuthentication();
    
    // Configura los eventos
    this.setupPasswordToggle();
    this.setupFormSubmission();
  }

  
  //Configura el botón para mostrar/ocultar contraseña
  setupPasswordToggle() {
    if (!this.passwordToggleButton) return;

    this.passwordToggleButton.addEventListener("click", () => {
      try {
        const input = this.passwordToggleButton.previousElementSibling;
        const type = input.type === "password" ? "text" : "password";
        input.type = type;

        const icon = this.passwordToggleButton.querySelector("i");
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      } catch (error) {
        console.error("Error al cambiar visibilidad de contraseña:", error);
      }
    });
  }

  setupFormSubmission() {
    if (!this.form) return;

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
  }

  getFormData() {
    const username = document.getElementById("nombreUsuario")?.value.trim();
    const password = document.getElementById("contrasena")?.value;

    if (!username || !password) {
      this.notificationManager.showNotification("Debes completar todos los campos", "error");
      return null;
    }

    return { username, password };
  }

  handleSuccessfulLogin() {
    this.notificationManager.showNotification(
      `¡Bienvenido ${UserManager.getCurrentUserFullName()}!`, 
      "success"
    );

    setTimeout(() => {
      window.location.href = "../inventario/inventario.html";
    }, 1500);
  }

  async handleFormSubmit() {
    try {
      const formData = this.getFormData();
      if (!formData) return;

      const result = await UserManager.login(
        formData.username, 
        formData.password
      );

      if (result.success) {
        this.handleSuccessfulLogin(result.user);
      } else {
        this.notificationManager.showNotification(
          result.message, 
          "error"
        );
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      this.notificationManager.showNotification(
        "Error al procesar el inicio de sesión", 
        "error"
      );
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const loginManager = new LoginManager();
  loginManager.init();
});