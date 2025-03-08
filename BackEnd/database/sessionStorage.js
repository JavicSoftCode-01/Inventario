import {ExecuteManager} from "../utils/execute.js";

class SessionStorageManager {

  // Obtener datos de sessionStorage
  static getData(key) {
    return ExecuteManager.execute(() => {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }, "Éxito al obtener datos del usuario.", "Error al obtener datos del usuario:");
  }

  // Guardar datos en sessionStorage
  static setData(key, data) {
    return ExecuteManager.execute(() => {
      if (data == null) throw new Error("Datos inválidos: no pueden ser nulos o indefinidos.");
      const serialized = JSON.stringify(data);
      // Opcional: se podría verificar el tamaño de los datos si se desea
      sessionStorage.setItem(key, serialized);
    }, "Éxito al guardar datos del usuario.", "Error al guardar datos del usuario:");
  }

  // Eliminar datos asociados a una clave en sessionStorage
  static removeData(key) {
    return ExecuteManager.execute(() => sessionStorage.removeItem(key), "Éxito al eliminar datos asociados a la clave del usuario.", "Error al eliminar datos asociados a la clave del usuario:");
  }

  // Limpiar todo el sessionStorage
  static clearData() {
    return ExecuteManager.execute(() => sessionStorage.clear(), "Éxito al limpiar todos los datos del sessionStorage.", "Error al limpiar todos los datos del sessionStorage:");
  }

  // Obtener la clave en una posición específica  en sessionStorage
  static getKey(index) {
    return ExecuteManager.execute(() => sessionStorage.key(index), "Éxito al obtener la clave del usuario.", "Error al obtener la clave del usuario:");
  }

  // Propiedad que retorna la cantidad de elementos almacenados
  static get length() {
    return ExecuteManager.execute(() => {
      return sessionStorage.length;
    }, "Éxito al obtener la longitud del usuario.", "Error al obtener la longitud del usuario:") ?? 0;
  }

  // Métodos CRUD para datos almacenados en formato lista (por ejemplo, sesiones o registros temporales)
  static createUser(key, newItem) {
    return ExecuteManager.execute(() => {
      const data = this.getData(key) || [];
      data.push(newItem);
      this.setData(key, data);
      return true;
    }, "Éxito al crear el registro.", "Error al crear el registro:") ?? false;
  }

  static updateUser(key, id, updatedItem, idField = "id") {
    return ExecuteManager.execute(() => {
      const data = this.getData(key) || [];
      const index = data.findIndex(item => item[idField] === id);
      if (index === -1) throw new Error("Registro del usuario no encontrado para actualizar.");
      data[index] = {...data[index], ...updatedItem};
      this.setData(key, data);
      return true;
    }, "Éxito al actualizar el registro del usuario.", "Error al actualizar el registro del usuario:") ?? false;
  }

  static deleteUser(key, id, idField = "id") {
    return ExecuteManager.execute(() => {
      const data = this.getData(key) || [];
      const newData = data.filter(item => item[idField] !== id);
      if (newData.length === data.length) throw new Error("Registro del usuario no encontrado para eliminar.");
      this.setData(key, newData);
      return true;
    }, "Éxito al eliminar el registro del usuario.", "Error al eliminar el registro del usuario:") ?? false;
  }
}

export {SessionStorageManager};