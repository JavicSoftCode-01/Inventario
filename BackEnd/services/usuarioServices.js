//import {Usuario} from "../models/usuario.js";
//import {getData, setData} from "../database/localStorage.js";
//
//const KEY_USUARIOS = "usuarios";
//const KEY_SESION_ACTUAL = "sesionActual";
//
//// Obtener todos los usuarios
//function obtenerUsuarios() {
//    return getData(KEY_USUARIOS) || [];
//}
//
//// Guardar usuarios en localStorage
//function guardarUsuarios(usuarios) {
//    setData(KEY_USUARIOS, usuarios);
//}
//
//// Crear nuevo usuario
//function registrarUsuario(datos) {
//    const usuarios = obtenerUsuarios();
//
//    // Verificar si el nombre de usuario ya existe
//    const usuarioExistente = usuarios.find(u => u.nombreUsuario === datos.nombreUsuario);
//    if (usuarioExistente) {
//        return {
//            exito: false,
//            mensaje: "El nombre de usuario ya está en uso"
//        };
//    }
//
//    // Crear nuevo usuario
//    const nuevoUsuario = new Usuario(
//        Date.now(),
//        datos.nombres,
//        datos.apellidos,
//        datos.fechaNacimiento,
//        datos.telefono,
//        datos.nombreUsuario,
//        datos.contrasena // En una aplicación real, deberías encriptar esta contraseña
//    );
//
//    usuarios.push(nuevoUsuario);
//    guardarUsuarios(usuarios);
//
//    return {
//        exito: true,
//        mensaje: "Usuario registrado con éxito"
//    };
//}
//
//// Iniciar sesión
//function iniciarSesion(nombreUsuario, contrasena) {
//    const usuarios = obtenerUsuarios();
//    const usuario = usuarios.find(
//        u => u.nombreUsuario === nombreUsuario && u.contrasena === contrasena
//    );
//
//    if (!usuario) {
//        return {
//            exito: false,
//            mensaje: "Nombre de usuario o contraseña incorrectos"
//        };
//    }
//
//    const sesionUsuario = {
//        id: usuario.id,
//        nombres: usuario.nombres,
//        apellidos: usuario.apellidos,
//        nombreUsuario: usuario.nombreUsuario,
//        nombreCompleto: usuario.nombreCompleto,
//        timestamp: Date.now() // <-- guardamos la hora actual en milisegundos
//    };
//
//    sessionStorage.setItem(KEY_SESION_ACTUAL, JSON.stringify(sesionUsuario));
//
//    return {
//        exito: true,
//        mensaje: "Inicio de sesión exitoso",
//        usuario: sesionUsuario
//    };
//}
//
//// Verificar si hay una sesión activa
//function obtenerSesionActual() {
//    const sesionJSON = sessionStorage.getItem(KEY_SESION_ACTUAL);
//    return sesionJSON ? JSON.parse(sesionJSON) : null;
//}
//
//// Cerrar sesión
//function cerrarSesion() {
//    sessionStorage.removeItem(KEY_SESION_ACTUAL);
//    window.location.href = "../auth/login.html";
//    return {exito: true, mensaje: "Sesión cerrada con éxito"};
//}
//
//// Verificar si un usuario es propietario de un registro
//function esUsuarioPropietario(usuarioId, autorizado) {
//    const sesion = obtenerSesionActual();
//    if (!sesion) return false;
//
//    // Verificamos si el nombre de usuario coincide con quien autorizó el registro
//    return sesion.nombreUsuario === autorizado;
//}
//
//export {
//    obtenerUsuarios,
//    registrarUsuario,
//    iniciarSesion,
//    obtenerSesionActual,
//    cerrarSesion,
//    esUsuarioPropietario,
//    nombreCompleto
//};//

//import { Usuario } from "../models/usuario.js";
//import { SessionStorageManager } from "../database/sessionStorage.js";
//
//class UserManager {
//  // Constantes para claves de sessionStorage
//  static #KEY_USERS = "users";
//  static #KEY_CURRENT_SESSION = "currentSession";
//
//  /**
//   * Registra un nuevo usuario
//   * @param {Object} userData - Datos del usuario a registrar
//   * @returns {Object} Resultado del registro
//   */
//  static registerUser(userData) {
//    try {
//      // Obtener usuarios existentes
//      const users = SessionStorageManager.getData(this.#KEY_USERS) || [];
//
//      // Verificar si el nombre de usuario ya existe
//      const userExists = users.some(u => u.nombreUsuario === userData.nombreUsuario);
//      if (userExists) {
//        return {
//          success: false,
//          message: "El nombre de usuario ya está en uso"
//        };
//      }
//
//      // Crear nuevo usuario
//      const newUser = new Usuario(
//        Date.now(),
//        userData.nombres,
//        userData.apellidos,
//        userData.fechaNacimiento,
//        userData.telefono,
//        userData.nombreUsuario,
//        userData.contrasena // En producción, usar hash de contraseña
//      );
//
//      // Agregar usuario y guardar
//      users.push(newUser);
//      SessionStorageManager.setData(this.#KEY_USERS, users);
//
//      return {
//        success: true,
//        message: "Usuario registrado con éxito"
//      };
//    } catch (error) {
//      console.error("Error al registrar usuario:", error);
//      return {
//        success: false,
//        message: "Ocurrió un error al registrar el usuario"
//      };
//    }
//  }
//
//  /**
//   * Iniciar sesión de usuario
//   * @param {string} username - Nombre de usuario
//   * @param {string} password - Contraseña
//   * @returns {Object} Resultado del inicio de sesión
//   */
//  static login(username, password) {
//    try {
//      const users = SessionStorageManager.getData(this.#KEY_USERS) || [];
//      
//      // Buscar usuario
//      const user = users.find(
//        u => u.nombreUsuario === username && u.contrasena === password
//      );
//
//      if (!user) {
//        return {
//          success: false,
//          message: "Nombre de usuario o contraseña incorrectos"
//        };
//      }
//
//      // Crear objeto de sesión
//      const sessionData = {
//        id: user.id,
//        nombres: user.nombres,
//        apellidos: user.apellidos,
//        nombreUsuario: user.nombreUsuario,
//        nombreCompleto: user.nombreCompleto,
//        timestamp: Date.now()
//      };
//
//      // Guardar sesión
//      SessionStorageManager.setData(this.#KEY_CURRENT_SESSION, sessionData);
//
//      return {
//        success: true,
//        message: "Inicio de sesión exitoso",
//        user: sessionData
//      };
//    } catch (error) {
//      console.error("Error al iniciar sesión:", error);
//      return {
//        success: false,
//        message: "Ocurrió un error al iniciar sesión"
//      };
//    }
//  }
//
//  /**
//   * Obtener sesión actual
//   * @returns {Object|null} Datos de sesión actual
//   */
//  static getCurrentSession() {
//    return SessionStorageManager.getData(this.#KEY_CURRENT_SESSION);
//  }
//
//  /**
//   * Obtener nombre completo del usuario actual
//   * @returns {string} Nombre completo o "Desconocido"
//   */
//  static getCurrentUserFullName() {
//    const session = this.getCurrentSession();
//    return session 
//      ? `${session.nombres} ${session.apellidos}` 
//      : "Desconocido";
//  }
//
//  /**
//   * Cerrar sesión
//   * @returns {Object} Resultado del cierre de sesión
//   */
//  static logout() {
//    try {
//      SessionStorageManager.removeData(this.#KEY_CURRENT_SESSION);
//      window.location.href = "../auth/login.html";
//      return { 
//        success: true, 
//        message: "Sesión cerrada con éxito" 
//      };
//    } catch (error) {
//      console.error("Error al cerrar sesión:", error);
//      return { 
//        success: false, 
//        message: "Ocurrió un error al cerrar sesión" 
//      };
//    }
//  }
//
//  /**
//   * Verificar si el usuario actual es propietario
//   * @param {string} authorizedUsername - Nombre de usuario autorizado
//   * @returns {boolean} Si el usuario es propietario
//   */
//  static isUserOwner(authorizedUsername) {
//    const session = this.getCurrentSession();
//    return session ? session.nombreUsuario === authorizedUsername : false;
//  }
//}
//
//export { UserManager };

import { Usuario } from "../models/usuario.js";
import { SessionStorageManager } from "../database/sessionStorage.js";

class UserManager {
  // Constantes para claves de sessionStorage
  static #KEY_USERS = "users";
  static #KEY_CURRENT_SESSION = "currentSession";

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Object} Resultado del registro
   */
  static registerUser(userData) {
    try {
      // Obtener usuarios existentes
      const users = SessionStorageManager.getData(this.#KEY_USERS) || [];

      // Verificar si el nombre de usuario ya existe
      const userExists = users.some(u => u.nombreUsuario === userData.nombreUsuario);
      if (userExists) {
        return {
          success: false,
          message: "El nombre de usuario ya está en uso"
        };
      }

      // Crear nuevo usuario
      const newUser = new Usuario(
        Date.now(),
        userData.nombres,
        userData.apellidos,
        userData.fechaNacimiento,
        userData.telefono,
        userData.nombreUsuario,
        userData.contrasena // En producción, usar hash de contraseña
      );

      // Usar método createUser para agregar usuario
      const result = SessionStorageManager.createUser(newUser);

      return {
        success: result,
        message: result 
          ? "Usuario registrado con éxito" 
          : "Ocurrió un error al registrar el usuario"
      };
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      return {
        success: false,
        message: "Ocurrió un error al registrar el usuario"
      };
    }
  }

  /**
   * Iniciar sesión de usuario
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Object} Resultado del inicio de sesión
   */
  static login(username, password) {
    try {
      const users = SessionStorageManager.getData(this.#KEY_USERS) || [];
      
      // Buscar usuario
      const user = users.find(
        u => u.nombreUsuario === username && u.contrasena === password
      );

      if (!user) {
        return {
          success: false,
          message: "Nombre de usuario o contraseña incorrectos"
        };
      }

      // Crear objeto de sesión
      const sessionData = {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        nombreUsuario: user.nombreUsuario,
        nombreCompleto: user.nombreCompleto,
        timestamp: Date.now()
      };

      // Guardar sesión usando setData
      SessionStorageManager.setData(this.#KEY_CURRENT_SESSION, sessionData);

      return {
        success: true,
        message: "Inicio de sesión exitoso",
        user: sessionData
      };
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return {
        success: false,
        message: "Ocurrió un error al iniciar sesión"
      };
    }
  }

  /**
   * Obtener sesión actual
   * @returns {Object|null} Datos de sesión actual
   */
  static getCurrentSession() {
    return SessionStorageManager.getData(this.#KEY_CURRENT_SESSION);
  }

  /**
   * Obtener nombre completo del usuario actual
   * @returns {string} Nombre completo o "Desconocido"
   */
  static getCurrentUserFullName() {
    const session = this.getCurrentSession();
    return session 
      ? `${session.nombres} ${session.apellidos}` 
      : "Desconocido";
  }

  /**
   * Cerrar sesión
   * @returns {Object} Resultado del cierre de sesión
   */
  static logout() {
    try {
      // Usar removeData para eliminar sesión
      SessionStorageManager.removeData(this.#KEY_CURRENT_SESSION);
      window.location.href = "../auth/login.html";
      return { 
        success: true, 
        message: "Sesión cerrada con éxito" 
      };
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      return { 
        success: false, 
        message: "Ocurrió un error al cerrar sesión" 
      };
    }
  }

  /**
   * Actualizar información del usuario
   * @param {number} id - ID del usuario a actualizar
   * @param {Object} updatedData - Datos a actualizar
   * @returns {Object} Resultado de la actualización
   */
  static updateUser(id, updatedData) {
    try {
      const result = SessionStorageManager.updateUser(id, updatedData);
      return {
        success: result,
        message: result 
          ? "Usuario actualizado con éxito" 
          : "Error al actualizar el usuario"
      };
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return {
        success: false,
        message: "Ocurrió un error al actualizar el usuario"
      };
    }
  }

  /**
   * Verificar si el usuario actual es propietario
   * @param {string} authorizedUsername - Nombre de usuario autorizado
   * @returns {boolean} Si el usuario es propietario
   */
    static isUserOwner(authorizedUsername) {
    try {
      const session = this.getCurrentSession();
      if (!session) {
        console.log('No hay sesión activa');
        return false;
      }
  
      console.log('Comparando usuarios:', {
        sessionUser: session.nombreUsuario,
        authorizedUser: authorizedUsername
      });
  
      return session.nombreUsuario === authorizedUsername;
    } catch (error) {
      console.error('Error en isUserOwner:', error);
      return false;
    }
  }
}

export { UserManager };