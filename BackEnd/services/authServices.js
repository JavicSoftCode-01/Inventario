import {NotificationManager} from "../../FrontEnd/static/scripts/utils/showNotifications.js";
import {SessionStorageManager} from "../database/sessionStorage.js";
import {Usuario} from "../models/usuario.js";
import {ExecuteManager} from "../utils/execute.js";

class AuthManager {

  // Bloque de inicialización estático
  static {
    this._KEY_USERS = "users";
    this._KEY_CURRENT_SESSION = "currentSession";
    this._LOGIN_PATH = "/FrontEnd/pages/auth/login.html";
    this._INVENTORY_PATH = "/FrontEnd/pages/inventario/inventario.html";
  }

  // Obtiene la ruta base según la estructura del proyecto.
  getBasePath() {
    return ExecuteManager.execute(
      () => {
        const path = window.location.pathname;
        const baseIndex = path.includes("FrontEnd") ? path.indexOf("FrontEnd") : path.indexOf("BackEnd");
        return path.substring(0, baseIndex);
      },
      "Exito! Al obtener la Base path.",
      "Error! Al obtener la base path:"
    );
  }

  // Retorna el nombre completo del usuario logueado
  getUserFullName() {
    return ExecuteManager.execute(
      () => {
        const session = this.getCurrentSession();
        return session ? `${session.nombres} ${session.apellidos}` : "Desconocido";
      },
      "Exito! Al obtener el nombre completo.",
      "Error! Al obtener el nombre completo:"
    );
  }

  /**
   * 🔰 Redirecciona a la ruta indicada, concatenándola a la ruta base. 🔰
   */
  static redirectTo(path) {
    return ExecuteManager.execute(
      () => {
        const basePath = this.getBasePath();
        window.location.replace(`${basePath}${path.startsWith("/") ? path.slice(1) : path}`);
      },
      "Exito! Al redireccionar.",
      "Error! Al redireccionar:"
    );
  }

  /**
   * 🔰 Verifica la autenticación del usuario y redirecciona según el estado de la sesión. 🔰
   */
  static verifyAuthentication() {
    return ExecuteManager.execute(
      () => {
        const currentSession = this.getCurrentSession();
        const currentUrl = window.location.href;
        const isAuthPage = currentUrl.includes("login.html") || currentUrl.includes("register.html");

        if (isAuthPage && !currentSession) return true;

        if (currentSession) {
          const now = Date.now();
          const elapsedTime = now - (currentSession.timestamp || 0);
          const oneHour = 60 * 60 * 1000;
          if (elapsedTime > oneHour) {
            SessionStorageManager.removeData(this._KEY_CURRENT_SESSION);
            if (!isAuthPage) {
              NotificationManager.info("Su sesión ha expirado. Por favor, inicie sesión nuevamente.");
              setTimeout(() => {
                this.redirectTo(this._LOGIN_PATH);
              }, 1500);
              return false;
            }
            return true;
          }
        }

        if (!currentSession && !isAuthPage) {
          NotificationManager.info("Debe iniciar sesión para acceder");
          this.redirectTo(this._LOGIN_PATH);
          return false;
        }

        if (currentSession && isAuthPage) {
          this.redirectTo(this._INVENTORY_PATH);
          return false;
        }

        return true;
      },
      "Exito! al verificar la autenticación.",
      "Error! al verificar la autenticación:"
    );
  }

  /**
   * 🔰 Registra un nuevo usuario en el sessionStorage. 🔰
   */
  static register(userData) {
    return ExecuteManager.execute(
      () => {
        const users = SessionStorageManager.getData(this._KEY_USERS) || [];
        if (users.some(u => u.nombreUsuario === userData.nombreUsuario)) {
          NotificationManager.info("El nombre de usuario ya está en uso");
          return;
        }
        const newUser = new Usuario(
          Date.now(),
          userData.nombres,
          userData.apellidos,
          userData.fechaNacimiento,
          userData.telefono,
          userData.nombreUsuario,
          userData.contrasena // En producción, se debe usar un hash de contraseña
        );
        const result = SessionStorageManager.createUser(this._KEY_USERS, newUser);
        result
          ? NotificationManager.success("Exito! Usuario registrado")
          : NotificationManager.error("Error! Al registrar el usuario");
      },
      "Éxito! Usuario registrado.",
      "Error! Al registrar usuario:"
    );
  }

  /**
   * 🔰 Inicia sesión buscando el usuario y almacenando la sesión en el sessionStorage. 🔰
   */
  static login(username, password) {
    return ExecuteManager.execute(
      () => {
        const users = SessionStorageManager.getData(this._KEY_USERS) || [];
        const user = users.find(u => u.nombreUsuario === username && u.contrasena === password);
        if (!user) {
          NotificationManager.error("Error! Usuario o contraseña incorrectos");
          return;
        }
        const sessionData = {
          id: user.id,
          nombres: user.nombres,
          apellidos: user.apellidos,
          nombreUsuario: user.nombreUsuario,
          nombreCompleto: user.nombreCompleto || `${user.nombres} ${user.apellidos}`,
          timestamp: Date.now()
        };
        SessionStorageManager.setData(this._KEY_CURRENT_SESSION, sessionData);
        NotificationManager.success("Bienvenido! " + this.getUserFullName());
        setTimeout(() => {
          this.redirectTo(this._INVENTORY_PATH);
        }, 2000);
      },
      "Éxito! Al iniciar sesión.",
      "Error! Al iniciar sesión:"
    );
  }

  /**
   *  🔰Cierra la sesión del usuario y redirecciona a la página de login. 🔰
   */
  static logout() {
    return ExecuteManager.execute(
      () => {
        SessionStorageManager.removeData(this._KEY_CURRENT_SESSION);
        NotificationManager.success("Exito! Cerrando Sesion");
        setTimeout(() => {
          this.redirectTo(this._LOGIN_PATH);
        }, 2000);
      },
      "Éxito! Al cerrar sesión.",
      "Error! Al cerrar sesión:"
    );
  }

  /**
   * 🔰 Retorna la sesión actual del usuario. 🔰
   */
  static getCurrentSession() {
    return ExecuteManager.execute(
      () => SessionStorageManager.getData(this._KEY_CURRENT_SESSION),
      "Exito! Al obtener la sesión.",
      "Error! Al obtener la sesión:"
    );
  }
}

export {AuthManager};