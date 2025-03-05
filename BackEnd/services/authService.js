import { NotificationManager } from "./../../FrontEnd/static/scripts/utils/showNotifications.js";
import { UserManager } from "./usuarioServices.js";
class AuthService {
  constructor() {
    this.notificationManager = new NotificationManager();
    this.LOGIN_PATH = "/FrontEnd/pages/auth/login.html";
    this.INVENTORY_PATH = "/FrontEnd/pages/inventario/inventario.html";
  }

  getBasePath() {
    const path = window.location.pathname;
    const baseIndex = path.indexOf('FrontEnd') !== -1
      ? path.indexOf('FrontEnd')
      : path.indexOf('BackEnd');
    return path.substring(0, baseIndex);
  }

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

          if (!isAuthPage) {
            this.notificationManager.showNotification(
              "Su sesión ha expirado. Por favor, inicie sesión nuevamente.", 
              "warning"
            );
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