//// BackEnd/database/localStorage.js
//
//function getData(key) {
//  const data = localStorage.getItem(key);
//  return data ? JSON.parse(data) : [];
//}
//
//function setData(key, data) {
//  localStorage.setItem(key, JSON.stringify(data));
//}
//
//export { getData, setData };
//

// LocalStorageManager.js

/**
 * Clase para gestionar operaciones CRUD en el localStorage.
 */
class LocalStorageManager {
  /**
   * Obtiene datos del localStorage.
   * @param {string} key - Clave para obtener los datos.
   * @returns {Array|Object} - Datos parseados o arreglo vacío si no existen datos.
   */
  static getData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error al obtener datos:", error.message);
      return [];
    }
  }

  /**
   * Guarda datos en el localStorage.
   * @param {string} key - Clave para almacenar los datos.
   * @param {Array|Object} data - Datos a almacenar.
   */
  static setData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error al guardar datos:", error.message);
    }
  }

  /**
   * Crea un nuevo registro en el localStorage.
   * @param {string} key - Clave donde se guardarán los datos.
   * @param {Object} newItem - Nuevo elemento a agregar.
   * @returns {boolean} - Retorna true si se agregó correctamente.
   */
  static create(key, newItem) {
    try {
      const data = LocalStorageManager.getData(key);
      data.push(newItem);
      LocalStorageManager.setData(key, data);
      return true;
    } catch (error) {
      console.error("Error al crear el registro:", error.message);
      return false;
    }
  }

  /**
   * Actualiza un registro en el localStorage.
   * @param {string} key - Clave donde se encuentran los datos.
   * @param {string|number} id - Identificador del registro a actualizar.
   * @param {Object} updatedItem - Datos actualizados para el registro.
   * @param {string} [idField="id"] - Campo que identifica el registro (por defecto "id").
   * @returns {boolean} - Retorna true si se actualizó correctamente.
   */
  static update(key, id, updatedItem, idField = "id") {
    try {
      const data = LocalStorageManager.getData(key);
      const index = data.findIndex(item => item[idField] === id);
      if (index === -1) {
        console.error("Registro no encontrado para actualizar.");
        return false;
      }
      data[index] = { ...data[index], ...updatedItem };
      LocalStorageManager.setData(key, data);
      return true;
    } catch (error) {
      console.error("Error al actualizar el registro:", error.message);
      return false;
    }
  }

  /**
   * Elimina un registro del localStorage.
   * @param {string} key - Clave donde se encuentran los datos.
   * @param {string|number} id - Identificador del registro a eliminar.
   * @param {string} [idField="id"] - Campo que identifica el registro (por defecto "id").
   * @returns {boolean} - Retorna true si se eliminó correctamente.
   */
  static delete(key, id, idField = "id") {
    try {
      const data = LocalStorageManager.getData(key);
      const newData = data.filter(item => item[idField] !== id);
      if (newData.length === data.length) {
        console.error("Registro no encontrado para eliminar.");
        return false;
      }
      LocalStorageManager.setData(key, newData);
      return true;
    } catch (error) {
      console.error("Error al eliminar el registro:", error.message);
      return false;
    }
  }
}

// Exporta la clase para ser utilizada en otros módulos
export { LocalStorageManager };
