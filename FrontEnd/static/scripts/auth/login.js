import { iniciarSesion } from "../../../../BackEnd/services/usuarioServices.js";
import { showNotification } from "../utils/showNotifications.js";
import { verificarAutenticacion } from "../../../../BackEnd/services/authService.js";

document.addEventListener("DOMContentLoaded", () => {
  // Verificar autenticación (redirige si ya hay sesión)
  verificarAutenticacion();

  const form = document.getElementById("login-form");
  const togglePasswordButton = document.querySelector(".toggle-password");

  // Gestionar visibilidad de contraseña
  togglePasswordButton?.addEventListener("click", () => {
    const input = togglePasswordButton.previousElementSibling;
    const type = input.getAttribute("type") === "password" ? "text" : "password";
    input.setAttribute("type", type);

    // Cambiar el ícono
    const icon = togglePasswordButton.querySelector("i");
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });

  // Procesar formulario de login
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombreUsuario = document.getElementById("nombreUsuario").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    if (!nombreUsuario || !contrasena) {
      showNotification("Debes completar todos los campos", "error");
      return;
    }

    // Iniciar sesión
    const resultado = iniciarSesion(nombreUsuario, contrasena);

    if (resultado.exito) {
      showNotification(`Bienvenido ${resultado.usuario.nombres}!`, "success");

      // Redirigir a inventario después de un breve retraso
      setTimeout(() => {
        window.location.href = "../inventario/inventario.html";
      }, 1800);
    } else {
      showNotification(resultado.mensaje, "error");
    }
  });
});