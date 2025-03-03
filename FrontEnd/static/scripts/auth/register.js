import { registrarUsuario } from "../../../../BackEnd/services/usuarioServices.js";
import { showNotification } from "../utils/showNotifications.js";
import { verificarAutenticacion } from "../../../../BackEnd/services/authService.js";

document.addEventListener("DOMContentLoaded", () => {
  // Verificar autenticación (redirige si ya hay sesión)
  verificarAutenticacion();

  const form = document.getElementById("registro-form");
  const togglePasswordButtons = document.querySelectorAll(".toggle-password");

  // Gestionar visibilidad de contraseñas
  togglePasswordButtons.forEach(button => {
    button.addEventListener("click", () => {
      const input = button.previousElementSibling;
      const type = input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);

      // Cambiar el ícono
      const icon = button.querySelector("i");
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  });

  // Procesar formulario de registro
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombres = document.getElementById("nombres").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const fechaNacimiento = document.getElementById("fechaNacimiento").value;
    const telefono = document.getElementById("telefono").value.trim();
    const nombreUsuario = document.getElementById("nombreUsuario").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const confirmarContrasena = document.getElementById("confirmarContrasena").value;

    // Validar que las contraseñas coincidan
    if (contrasena !== confirmarContrasena) {
      showNotification("Las contraseñas no coinciden", "error");
      return;
    }

    // Validar fecha de nacimiento
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    const edadMinima = 18;

    const anios = hoy.getFullYear() - fechaNac.getFullYear();
    const meses = hoy.getMonth() - fechaNac.getMonth();

    if (anios < edadMinima || (anios === edadMinima && meses < 0)) {
      showNotification("Debes ser mayor de 18 años para registrarte", "error");
      return;
    }

    // Crear el usuario
    const resultado = registrarUsuario({
      nombres,
      apellidos,
      fechaNacimiento,
      telefono,
      nombreUsuario,
      contrasena
    });

    if (resultado.exito) {
      showNotification(resultado.mensaje, "success");

      // Redirigir al login después de un breve retraso
      setTimeout(() => {
        window.location.href = "../auth/login.html";
      }, 1000);
    } else {
      showNotification(resultado.mensaje, "error");
    }
  });
});