import { obtenerSesionActual } from "./usuarioServices.js";
import { showNotification } from "../../FrontEnd/static/scripts/utils/showNotifications.js";

// Verifica si hay un usuario autenticado y redirige si es necesario
function verificarAutenticacion() {
  const sesionActual = obtenerSesionActual();
  const esPaginaAuth = window.location.href.includes("login.html") ||
                       window.location.href.includes("register.html");

  // 1) Si no hay sesión y no estamos en login/registro => Redirigir a login
  if (!sesionActual && !esPaginaAuth) {
    showNotification("Debe iniciar sesión para acceder", "error");
    window.location.href = "../../FrontEnd/pages/auth/login.html";
    return false;
  }

  // 2) Si hay sesión, verificar si ya pasó 1 hora
  if (sesionActual) {
    const now = Date.now();
    const diff = now - (sesionActual.timestamp || 0);
    const oneHour = 60 * 60 * 1000; // 1 hora en ms

    if (diff > oneHour) {
      // Sesión expirada
      sessionStorage.removeItem("sesionActual");
      showNotification("Su sesión ha expirado. Ingrese nuevamente.", "error");
      window.location.href = "../auth/login.html";
      return false;
    }
  }

  // 3) Si hay sesión y estamos en login/registro => Redirigir a inventario
  if (sesionActual && esPaginaAuth) {
    window.location.href = "../../FrontEnd/pages/inventario/inventario.html";
    return false;
  }

  return true;
}

// Actualiza elementos de la interfaz según el estado de la sesión
function actualizarUISegunSesion() {
  const sesionActual = obtenerSesionActual();

  // Buscar elementos de la UI relacionados con la sesión
  const userInfoElement = document.getElementById("user-info");
  const logoutButton = document.getElementById("btn-logout");

  if (userInfoElement && sesionActual) {
    userInfoElement.innerHTML = `
      <span class="username">${sesionActual.nombreUsuario}</span>
      <span class="user-fullname">${sesionActual.nombreCompleto}</span>
    `;
    userInfoElement.style.display = "flex";
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem("sesionActual");
      window.location.href = "../auth/login.html";
    });
  }
}

export { verificarAutenticacion, actualizarUISegunSesion };