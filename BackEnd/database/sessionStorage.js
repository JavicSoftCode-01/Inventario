//// BackEnd/database/sessionStorage.js
//
//// Guarda un objeto en sessionStorage como JSON
//function setSessionData(key, value) {
//    if (typeof value === "object") {
//      sessionStorage.setItem(key, JSON.stringify(value));
//    } else {
//      sessionStorage.setItem(key, value);
//    }
//  }
//  
//  // Obtiene un objeto desde sessionStorage (parseado de JSON)
//  function getSessionData(key) {
//    const data = sessionStorage.getItem(key);
//    try {
//      return JSON.parse(data);
//    } catch (error) {
//      return data; // si no se puede parsear, retorna tal cual
//    }
//  }
//  
//  // Elimina un item del sessionStorage
//  function removeSessionData(key) {
//    sessionStorage.removeItem(key);
//  }
//  
//  export { setSessionData, getSessionData, removeSessionData };
  

// SessionStorageManager.js

/**
 * Clase para gestionar operaciones con sessionStorage, incluyendo
 * métodos CRUD básicos y operaciones específicas para usuarios.
 */
class SessionStorageManager {
  /**
   * Guarda datos en sessionStorage. Si el valor es un objeto, lo convierte a JSON.
   * @param {string} key - Clave para almacenar los datos.
   * @param {any} value - Valor a almacenar.
   */
  static setData(key, value) {
    try {
      // Si el valor es un objeto, lo convierte a JSON; de lo contrario, lo almacena directamente.
      const data = typeof value === "object" ? JSON.stringify(value) : value;
      sessionStorage.setItem(key, data);
    } catch (error) {
      console.error("Error al guardar datos en sessionStorage:", error.message);
    }
  }

  /**
   * Obtiene datos de sessionStorage y trata de parsearlos como JSON.
   * @param {string} key - Clave de donde obtener los datos.
   * @returns {any} - Datos parseados o el valor original si no es JSON.
   */
  static getData(key) {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      // Si ocurre un error al parsear, retorna el dato sin parsear.
      return sessionStorage.getItem(key);
    }
  }

  /**
   * Elimina datos de sessionStorage.
   * @param {string} key - Clave del dato a eliminar.
   */
  static removeData(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error("Error al eliminar datos de sessionStorage:", error.message);
    }
  }

  /**
   * Crea un nuevo usuario y lo almacena en sessionStorage bajo la clave "users".
   * Se asume que los usuarios se almacenan como un arreglo.
   * @param {Object} user - Objeto que representa al usuario (debe tener un identificador único, p.ej. id).
   * @returns {boolean} - Retorna true si se creó el usuario correctamente.
   */
  static createUser(user) {
    try {
      let users = SessionStorageManager.getData("users");
      // Si no existe el arreglo de usuarios, inicializa un arreglo vacío.
      if (!Array.isArray(users)) {
        users = [];
      }
      users.push(user);
      SessionStorageManager.setData("users", users);
      return true;
    } catch (error) {
      console.error("Error al crear usuario:", error.message);
      return false;
    }
  }

  /**
   * Actualiza la información de un usuario existente en sessionStorage.
   * Busca el usuario por su campo 'id' y actualiza sus datos.
   * @param {string|number} id - Identificador único del usuario.
   * @param {Object} updatedData - Objeto con los datos a actualizar.
   * @returns {boolean} - Retorna true si se actualizó el usuario correctamente.
   */
  static updateUser(id, updatedData) {
    try {
      let users = SessionStorageManager.getData("users");
      if (!Array.isArray(users)) {
        console.error("No existen usuarios almacenados para actualizar.");
        return false;
      }
      const index = users.findIndex(user => user.id === id);
      if (index === -1) {
        console.error("Usuario no encontrado para actualizar.");
        return false;
      }
      // Fusiona los datos existentes del usuario con los datos actualizados.
      users[index] = { ...users[index], ...updatedData };
      SessionStorageManager.setData("users", users);
      return true;
    } catch (error) {
      console.error("Error al actualizar usuario:", error.message);
      return false;
    }
  }
}

// Exporta la clase para ser utilizada en otros módulos
export { SessionStorageManager };
