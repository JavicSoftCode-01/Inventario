import { UserManager } from "../../../../BackEnd/services/usuarioServices.js";
import { NotificationManager } from "../utils/showNotifications.js";
import { AuthService } from "../../../../BackEnd/services/authService.js";

class RegisterManager {
  constructor() {
    this.form = document.getElementById("registro-form");
    this.passwordToggleButtons = document.querySelectorAll(".toggle-password");
    this.notificationManager = new NotificationManager();
    this.authService = new AuthService();
  }

  //  Inicializa los manejadores de eventos
   
  init() {
    // Verifica autenticación al cargar
    this.authService.verifyAuthentication();
    
    // Configura los eventos
    this.setupPasswordToggles();
    this.setupFormSubmission();
  }

  
  //  Configura los botones para mostrar/ocultar contraseñas
   
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

  setupFormSubmission() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
  }

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

  validatePasswords(password, confirmPassword) {
    if (password !== confirmPassword) {
      this.notificationManager.showNotification("Las contraseñas no coinciden", "error");
      return false;
    }
    return true;
  }

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