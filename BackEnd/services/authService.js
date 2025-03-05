//import {obtenerSesionActual} from "./usuarioServices.js";
//import {showNotification} from "../../FrontEnd/static/scripts/utils/showNotifications.js";
//
//// Verifica si hay un usuario autenticado y redirige si es necesario
//function verificarAutenticacion() {
//    const sesionActual = obtenerSesionActual();
//    const esPaginaAuth = window.location.href.includes("login.html") ||
//        window.location.href.includes("register.html");
//
//    // 1) Si no hay sesión y no estamos en login/registro => Redirigir a login
//    if (!sesionActual && !esPaginaAuth) {
//        showNotification("Debe iniciar sesión para acceder", "error");
//        window.location.href = "../../FrontEnd/pages/auth/login.html";
//        return false;
//    }
//
//    // 2) Si hay sesión, verificar si ya pasó 1 hora
//    if (sesionActual) {
//        const now = Date.now();
//        const diff = now - (sesionActual.timestamp || 0);
//        const oneHour = 60 * 60 * 1000; // 1 hora en ms
//
//        if (diff > oneHour) {
//          // Sesión expirada
//          sessionStorage.removeItem("sesionActual");
//          // showNotification("Su sesión ha expirado. Ingrese nuevamente.", "error");
//          window.location.href = "../auth/login.html";
//          return false;
//        }
//    }
//
//    // 3) Si hay sesión y estamos en login/registro => Redirigir a inventario
//    if (sesionActual && esPaginaAuth) {
//        window.location.href = "../../FrontEnd/pages/inventario/inventario.html";
//        return false;
//    }
//
//    return true;
//}
//
//// Actualiza elementos de la interfaz según el estado de la sesión
//function actualizarUISegunSesion() {
//    const sesionActual = obtenerSesionActual();
//
//    // Buscar elementos de la UI relacionados con la sesión
//    const userInfoElement = document.getElementById("user-info");
//    const logoutButton = document.getElementById("btn-logout");
//
//    if (userInfoElement && sesionActual) {
//        userInfoElement.innerHTML = `
//      <span class="username">${sesionActual.nombreUsuario}</span>
//      <span class="user-fullname">${sesionActual.nombreCompleto}</span>
//    `;
//        userInfoElement.style.display = "flex";
//    }
//
//    if (logoutButton) {
//        logoutButton.addEventListener("click", () => {
//            sessionStorage.removeItem("sesionActual");
//            window.location.href = "../auth/login.html";
//        });
//    }
//}
//
//export {verificarAutenticacion, actualizarUISegunSesion};

import { UserManager } from "./usuarioServices.js";
import { NotificationManager } from "../../FrontEnd/static/scripts/utils/showNotifications.js";

/**
 * Clase AuthService para gestionar la autenticación y la actualización de la UI.
// */
//class AuthService {
//  constructor() {
//    // Instancia del gestor de notificaciones
//    this.notificationManager = new NotificationManager();
//  }
//
//  /**
//   * Verifica la autenticación del usuario y redirige según corresponda.
//   * @returns {boolean} True si la autenticación es válida, false en caso contrario.
//   */
//  verifyAuthentication() {
//    try {
//      const currentSession = UserManager.getCurrentSession();
//      const currentUrl = window.location.href;
//      const isAuthPage = currentUrl.includes("login.html") || currentUrl.includes("register.html");
//
//      // Si ya estamos en la página de login y no hay sesión, no hacer nada
//      if (isAuthPage && !currentSession) {
//        return true;
//      }
//
//      // Verificar sesión expirada
//      if (currentSession) {
//        const now = Date.now();
//        const elapsedTime = now - (currentSession.timestamp || 0);
//        const oneHour = 60 * 60 * 1000;
//
//        if (elapsedTime > oneHour) {
//          // Limpiar sesión
//          sessionStorage.removeItem("sesionActual");
//          
//          // Solo redirigir si NO estamos ya en la página de login
//          if (!isAuthPage) {
//            this.notificationManager.showNotification("Su sesión ha expirado. Por favor, inicie sesión nuevamente.", "warning");
//            window.location.replace("../auth/login.html");
//            return false;
//          }
//          return true;
//        }
//      }
//
//      // Resto de la lógica de verificación...
//      if (!currentSession && !isAuthPage) {
//        this.notificationManager.showNotification("Debe iniciar sesión para acceder", "error");
//        window.location.replace("../auth/login.html");
//        return false;
//      }
//
//      if (currentSession && isAuthPage) {
//        window.location.replace("../../FrontEnd/pages/inventario/inventario.html");
//        return false;
//      }
//
//      return true;
//    } catch (error) {
//      console.error("Error al verificar la autenticación:", error);
//      this.notificationManager.showNotification("Error al verificar la autenticación", "error");
//      return false;
//    }
//  }
//  //verifyAuthentication() {
//  //  try {
//  //    const currentSession = UserManager.getCurrentSession();
//  //    const currentUrl = window.location.href;
//  //    const isAuthPage = currentUrl.includes("login.html") || currentUrl.includes("register.html");
////
//  //    // 1) Si no hay sesión y no estamos en login/registro, redirigir a login
//  //    if (!currentSession && !isAuthPage) {
//  //      this.notificationManager.showNotification("Debe iniciar sesión para acceder", "error");
//  //      window.location.href = "../../FrontEnd/pages/auth/login.html";
//  //      return false;
//  //    }
////
//  //    // 2) Si hay sesión, verificar si ha expirado (más de 1 hora)
//  //    if (currentSession) {
//  //      const now = Date.now();
//  //      const elapsedTime = now - (currentSession.timestamp || 0);
//  //      const oneHour = 60 * 60 * 1000; // 1 hora en milisegundos
////
//  //      if (elapsedTime > oneHour) {
//  //        // Sesión expirada
//  //        sessionStorage.removeItem("sesionActual");
//  //        // Se puede informar al usuario en caso de necesitarlo
//  //        // this.notificationManager.showNotification("Su sesión ha expirado. Ingrese nuevamente.", "error");
//  //        window.location.href = "../auth/login.html";
//  //        return false;
//  //      }
//  //    }
////
//  //    // 3) Si hay sesión y se está en login/registro, redirigir a inventario
//  //    if (currentSession && isAuthPage) {
//  //      window.location.href = "../../FrontEnd/pages/inventario/inventario.html";
//  //      return false;
//  //    }
////
//  //    return true;
//  //  } catch (error) {
//  //    console.error("Error al verificar la autenticación:", error);
//  //    this.notificationManager.showNotification("Se produjo un error al verificar la autenticación.", "error");
//  //    return false;
//  //  }
//  //}
//
//  /**
//   * Actualiza la interfaz de usuario según el estado de la sesión.
//   */
//  updateUIForSession() {
//    try {
//      const currentSession = UserManager.getCurrentSession();
//      const userInfoEl = document.getElementById("user-info");
//      const logoutButton = document.getElementById("btn-logout");
//
//      if (userInfoEl && currentSession) {
//        userInfoEl.innerHTML = `
//          <span class="username">${currentSession.nombreUsuario}</span>
//          <span class="user-fullname">${currentSession.nombreCompleto}</span>
//        `;
//        userInfoEl.style.display = "flex";
//      }
//
//      if (logoutButton) {
//        logoutButton.addEventListener("click", () => {
//          try {
//            sessionStorage.removeItem("sesionActual");
//            window.location.href = "../auth/login.html";
//          } catch (err) {
//            console.error("Error al cerrar sesión:", err);
//            this.notificationManager.showNotification("Error al cerrar sesión.", "error");
//          }
//        });
//      }
//    } catch (error) {
//      console.error("Error al actualizar la interfaz:", error);
//      this.notificationManager.showNotification("Se produjo un error al actualizar la interfaz.", "error");
//    }
//  }
//}
//

class AuthService {
  constructor() {
    this.notificationManager = new NotificationManager();
    // Definir rutas base
    this.LOGIN_PATH = "/FrontEnd/pages/auth/login.html";
    this.INVENTORY_PATH = "/FrontEnd/pages/inventario/inventario.html";
  }

  /**
   * Obtiene la ruta base del proyecto
   * @returns {string} Ruta base
   */
  getBasePath() {
    const path = window.location.pathname;
    // Encuentra la posición de 'FrontEnd' o 'BackEnd' en la ruta
    const baseIndex = path.indexOf('FrontEnd') !== -1 
      ? path.indexOf('FrontEnd') 
      : path.indexOf('BackEnd');
    return path.substring(0, baseIndex);
  }

  /**
   * Redirige a una ruta específica
   * @param {string} path - Ruta relativa
   */
  redirectTo(path) {
    const basePath = this.getBasePath();
    window.location.replace(`${basePath}${path.startsWith('/') ? path.slice(1) : path}`);
  }

  verifyAuthentication() {
    try {
      const currentSession = UserManager.getCurrentSession();
      const currentUrl = window.location.href;
      const isAuthPage = currentUrl.includes("login.html") || currentUrl.includes("register.html");

      if (isAuthPage && !currentSession) {
        return true;
      }

      if (currentSession) {
        const now = Date.now();
        const elapsedTime = now - (currentSession.timestamp || 0);
        const oneHour = 60 * 60 * 1000;

        if (elapsedTime > oneHour) {
          sessionStorage.removeItem("sesionActual");
          
          //if (!isAuthPage) {
          //  this.notificationManager.showNotification(
          //    "Su sesión ha expirado. Por favor, inicie sesión nuevamente.", 
          //    "warning"
          //  );
          if (!isAuthPage) {
            setTimeout(() => {
              this.notificationManager.showNotification(
                "Su sesión ha expirado. Por favor, inicie sesión nuevamente.", 
                "warning"
              );
            }, 5000);
            this.redirectTo(this.LOGIN_PATH);
            return false;
          }
          return true;
        }
      }

      if (!currentSession && !isAuthPage) {
        this.notificationManager.showNotification("Debe iniciar sesión para acceder", "error");
        this.redirectTo(this.LOGIN_PATH);
        return false;
      }

      if (currentSession && isAuthPage) {
        this.redirectTo(this.INVENTORY_PATH);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error al verificar la autenticación:", error);
      this.notificationManager.showNotification("Error al verificar la autenticación", "error");
      return false;
    }
  }

  updateUIForSession() {
    try {
      const currentSession = UserManager.getCurrentSession();
      const userInfoEl = document.getElementById("user-info");
      const logoutButton = document.getElementById("btn-logout");

      if (userInfoEl && currentSession) {
        userInfoEl.innerHTML = `
          <span class="username">${currentSession.nombreUsuario}</span>
          <span class="user-fullname">${currentSession.nombreCompleto}</span>
        `;
        userInfoEl.style.display = "flex";
      }

      if (logoutButton) {
        logoutButton.addEventListener("click", () => {
          try {
            sessionStorage.removeItem("sesionActual");
            this.redirectTo(this.LOGIN_PATH);
          } catch (err) {
            console.error("Error al cerrar sesión:", err);
            this.notificationManager.showNotification("Error al cerrar sesión.", "error");
          }
        });
      }
    } catch (error) {
      console.error("Error al actualizar la interfaz:", error);
      this.notificationManager.showNotification("Se produjo un error al actualizar la interfaz.", "error");
    }
  }
}
export { AuthService };