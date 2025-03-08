import {ExecuteManager} from "../utils/execute.js";

class LocalStorageManager {

  // Obtener datos de localStorage
  static getData(key) {
    return ExecuteManager.execute(() => {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }, "Éxito al obtener datos.", "Error al obtener datos:");
  }

  // Guardar datos en localStorage
  static setData(key, data) {
    return ExecuteManager.execute(() => {
      if (data == null) throw new Error("Datos inválidos: no pueden ser nulos o indefinidos.");
      const serialized = JSON.stringify(data);
      const dataSize = new Blob([serialized]).size;
      const maxSize = 5 * 1024 * 1024; // 5MB límite típico
      if (dataSize > maxSize) throw new Error("Datos demasiado grandes para almacenar en localStorage.");
      localStorage.setItem(key, serialized);
    }, "Éxito al guardar datos.", "Error al guardar datos:");
  }

  // Eliminar datos asociados a una clave en localStorage
  static removeData(key) {
    return ExecuteManager.execute(() => localStorage.removeItem(key), "Éxito al eliminar datos asociados a la clave.", "Error al eliminar datos asociados a la clave:");
  }

  // Limpiar todo el localStorage
  static clearData() {
    return ExecuteManager.execute(() => localStorage.clear(), "Éxito al limpiar todos los datos del localStorage.", "Error al limpiar todos los datos del localStorage:");
  }

  // Obtener la clave en una posición específica en localStorage
  static getKey(index) {
    return ExecuteManager.execute(() => localStorage.key(index), "Éxito al obtener la clave.", "Error al obtener la clave:");
  }

  // Propiedad que retorna la cantidad de elementos almacenados en localStorage
  static get length() {
    return ExecuteManager.execute(() => localStorage.length, "Éxito al obtener la longitud.", "Error al obtener la longitud:") ?? 0;
  }

  // Crear un nuevo elemento en una lista almacenada en localStorage
  static create(key, newItem) {
    return ExecuteManager.execute(() => {
      const data = this.getData(key) || [];
      data.push(newItem);
      this.setData(key, data);
      return true;
    }, "Éxito al crear el registro.", "Error al crear el registro:") ?? false;
  }

  // Actualizar un elemento en una lista almacenada en localStorage
  static update(key, id, updatedItem, idField = "id") {
    return ExecuteManager.execute(() => {
      const data = this.getData(key) || [];
      const index = data.findIndex(item => item[idField] === id);
      if (index === -1) throw new Error("Registro no encontrado para actualizar.");
      data[index] = {...data[index], ...updatedItem};
      this.setData(key, data);
      return true;
    }, "Éxito al actualizar el registro.", "Error al actualizar el registro:") ?? false;
  }

  // Eliminar un elemento de una lista almacenada en localStorage
  static delete(key, id, idField = "id") {
    return ExecuteManager.execute(() => {
      const data = this.getData(key) || [];
      const newData = data.filter(item => item[idField] !== id);
      if (newData.length === data.length) throw new Error("Registro no encontrado para eliminar.");
      this.setData(key, newData);
      return true;
    }, "Éxito al eliminar el registro.", "Error al eliminar el registro:") ?? false;
  }
}

export {LocalStorageManager};