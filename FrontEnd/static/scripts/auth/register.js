//import { registrarUsuario } from "../../../../BackEnd/services/usuarioServices.js";
//import { showNotification } from "../utils/showNotifications.js";
//import { verificarAutenticacion } from "../../../../BackEnd/services/authService.js";
//
//document.addEventListener("DOMContentLoaded", () => {
//  // Verificar autenticación (redirige si ya hay sesión)
//  verificarAutenticacion();
//
//  const form = document.getElementById("registro-form");
//  const togglePasswordButtons = document.querySelectorAll(".toggle-password");
//
//  // Gestionar visibilidad de contraseñas
//  togglePasswordButtons.forEach(button => {
//    button.addEventListener("click", () => {
//      const input = button.previousElementSibling;
//      const type = input.getAttribute("type") === "password" ? "text" : "password";
//      input.setAttribute("type", type);
//
//      // Cambiar el ícono
//      const icon = button.querySelector("i");
//      icon.classList.toggle("fa-eye");
//      icon.classList.toggle("fa-eye-slash");
//    });
//  });
//
//  // Procesar formulario de registro
//  form.addEventListener("submit", (e) => {
//    e.preventDefault();
//
//    const nombres = document.getElementById("nombres").value.trim();
//    const apellidos = document.getElementById("apellidos").value.trim();
//    const fechaNacimiento = document.getElementById("fechaNacimiento").value;
//    const telefono = document.getElementById("telefono").value.trim();
//    const nombreUsuario = document.getElementById("nombreUsuario").value.trim();
//    const contrasena = document.getElementById("contrasena").value;
//    const confirmarContrasena = document.getElementById("confirmarContrasena").value;
//
//    // Validar que las contraseñas coincidan
//    if (contrasena !== confirmarContrasena) {
//      showNotification("Las contraseñas no coinciden", "error");
//      return;
//    }
//
//    // Validar fecha de nacimiento
//    const fechaNac = new Date(fechaNacimiento);
//    const hoy = new Date();
//    const edadMinima = 18;
//
//    const anios = hoy.getFullYear() - fechaNac.getFullYear();
//    const meses = hoy.getMonth() - fechaNac.getMonth();
//
//    if (anios < edadMinima || (anios === edadMinima && meses < 0)) {
//      showNotification("Debes ser mayor de 18 años para registrarte", "error");
//      return;
//    }
//
//    // Crear el usuario
//    const resultado = registrarUsuario({
//      nombres,
//      apellidos,
//      fechaNacimiento,
//      telefono,
//      nombreUsuario,
//      contrasena
//    });
//
//    if (resultado.exito) {
//      showNotification(resultado.mensaje, "success");
//
//      // Redirigir al login después de un breve retraso
//      setTimeout(() => {
//        window.location.href = "../auth/login.html";
//      }, 1000);
//    } else {
//      showNotification(resultado.mensaje, "error");
//    }
//  });
//});

import { UserManager } from "../../../../BackEnd/services/usuarioServices.js";
import { NotificationManager } from "../utils/showNotifications.js";
import { AuthService } from "../../../../BackEnd/services/authService.js";

/**
 * Clase para manejar el registro de usuarios
 */
class RegisterManager {
  constructor() {
    this.form = document.getElementById("registro-form");
    this.passwordToggleButtons = document.querySelectorAll(".toggle-password");
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
    this.setupPasswordToggles();
    this.setupFormSubmission();
  }

  /**
   * Configura los botones para mostrar/ocultar contraseñas
   */
  setupPasswordToggles() {
    this.passwordToggleButtons.forEach(button => {
      button.addEventListener("click", () => {
        try {
          const input = button.previousElementSibling;
          const type = input.type === "password" ? "text" : "password";
          input.type = type;

          const icon = button.querySelector("i");
          icon.classList.toggle("fa-eye");
          icon.classList.toggle("fa-eye-slash");
        } catch (error) {
          console.error("Error al cambiar visibilidad de contraseña:", error);
        }
      });
    });
  }

  /**
   * Configura el evento de envío del formulario
   */
  setupFormSubmission() {
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
    const formData = {
      nombres: document.getElementById("nombres").value.trim(),
      apellidos: document.getElementById("apellidos").value.trim(),
      fechaNacimiento: document.getElementById("fechaNacimiento").value,
      telefono: document.getElementById("telefono").value.trim(),
      nombreUsuario: document.getElementById("nombreUsuario").value.trim(),
      contrasena: document.getElementById("contrasena").value,
      confirmarContrasena: document.getElementById("confirmarContrasena").value
    };

    // Validar campos requeridos
    if (Object.values(formData).some(value => !value)) {
      this.notificationManager.showNotification("Todos los campos son requeridos", "error");
      return null;
    }

    return formData;
  }

  /**
   * Valida las contraseñas
   * @param {string} password - Contraseña
   * @param {string} confirmPassword - Confirmación de contraseña
   * @returns {boolean} True si son válidas
   */
  validatePasswords(password, confirmPassword) {
    if (password !== confirmPassword) {
      this.notificationManager.showNotification("Las contraseñas no coinciden", "error");
      return false;
    }
    return true;
  }

  /**
   * Valida la edad del usuario
   * @param {string} birthDate - Fecha de nacimiento
   * @returns {boolean} True si la edad es válida
   */
  validateAge(birthDate) {
    const birthDateTime = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateTime.getFullYear();
    const monthDiff = today.getMonth() - birthDateTime.getMonth();

    if (age < 18 || (age === 18 && monthDiff < 0)) {
      this.notificationManager.showNotification("Debes ser mayor de 18 años para registrarte", "error");
      return false;
    }
    return true;
  }

  /**
   * Maneja el envío del formulario
   */
  async handleFormSubmit() {
    try {
      const formData = this.getFormData();
      if (!formData) return;

      if (!this.validatePasswords(formData.contrasena, formData.confirmarContrasena)) return;
      if (!this.validateAge(formData.fechaNacimiento)) return;

      const result = await UserManager.registerUser(formData);

      if (result.success) {
        this.notificationManager.showNotification(result.message, "success");
        setTimeout(() => {
          window.location.href = "../auth/login.html";
        }, 1500);
      } else {
        this.notificationManager.showNotification(result.message, "error");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      this.notificationManager.showNotification("Error al procesar el registro", "error");
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const registerManager = new RegisterManager();
  registerManager.init();
});