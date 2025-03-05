//import { iniciarSesion } from "../../../../BackEnd/services/usuarioServices.js";
//import { showNotification } from "../utils/showNotifications.js";
//import { verificarAutenticacion } from "../../../../BackEnd/services/authService.js";
//
//document.addEventListener("DOMContentLoaded", () => {
//  // Verificar autenticación (redirige si ya hay sesión)
//  verificarAutenticacion();
//
//  const form = document.getElementById("login-form");
//  const togglePasswordButton = document.querySelector(".toggle-password");
//
//  // Gestionar visibilidad de contraseña
//  togglePasswordButton?.addEventListener("click", () => {
//    const input = togglePasswordButton.previousElementSibling;
//    const type = input.getAttribute("type") === "password" ? "text" : "password";
//    input.setAttribute("type", type);
//
//    // Cambiar el ícono
//    const icon = togglePasswordButton.querySelector("i");
//    icon.classList.toggle("fa-eye");
//    icon.classList.toggle("fa-eye-slash");
//  });
//
//  // Procesar formulario de login
//  form?.addEventListener("submit", (e) => {
//    e.preventDefault();
//
//    const nombreUsuario = document.getElementById("nombreUsuario").value.trim();
//    const contrasena = document.getElementById("contrasena").value;
//
//    if (!nombreUsuario || !contrasena) {
//      showNotification("Debes completar todos los campos", "error");
//      return;
//    }
//
//    // Iniciar sesión
//    const resultado = iniciarSesion(nombreUsuario, contrasena);
//
//    if (resultado.exito) {
//      showNotification(`Bienvenido ${resultado.usuario.nombres}!`, "success");
//
//      // Redirigir a inventario después de un breve retraso
//      setTimeout(() => {
//        window.location.href = "../inventario/inventario.html";
//      }, 1800);
//    } else {
//      showNotification(resultado.mensaje, "error");
//    }
//  });
//});

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

  /**
   * Inicializa los manejadores de eventos
   */
  init() {
    // Verifica autenticación al cargar
    this.authService.verifyAuthentication();
    
    // Configura los eventos
    this.setupPasswordToggle();
    this.setupFormSubmission();
  }

  /**
   * Configura el botón para mostrar/ocultar contraseña
   */
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

  /**
   * Configura el evento de envío del formulario
   */
  setupFormSubmission() {
    if (!this.form) return;

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
  }

  /**
   * Obtiene y valida los datos del formulario
   * @returns {Object|null} Datos del formulario o null si hay errores
   */
  getFormData() {
    const username = document.getElementById("nombreUsuario")?.value.trim();
    const password = document.getElementById("contrasena")?.value;

    if (!username || !password) {
      this.notificationManager.showNotification("Debes completar todos los campos", "error");
      return null;
    }

    return { username, password };
  }

  /**
   * Maneja la redirección después del inicio de sesión exitoso
   * @param {Object} user - Datos del usuario autenticado
   */
  handleSuccessfulLogin() {
    this.notificationManager.showNotification(
      `¡Bienvenido ${UserManager.getCurrentUserFullName()}!`, 
      "success"
    );

    setTimeout(() => {
      window.location.href = "../inventario/inventario.html";
    }, 1500);
  }

  /**
   * Maneja el envío del formulario
   */
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