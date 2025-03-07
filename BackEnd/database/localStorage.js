class LocalStorageManager {

    static getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error al obtener datos:", error.message);
            return [];
        }
    }

    static setData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error("Error al guardar datos:", error.message);
        }
    }

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

    static update(key, id, updatedItem, idField = "id") {
        try {
            const data = LocalStorageManager.getData(key);
            const index = data.findIndex(item => item[idField] === id);
            if (index === -1) {
                console.error("Registro no encontrado para actualizar.");
                return false;
            }
            data[index] = {...data[index], ...updatedItem};
            LocalStorageManager.setData(key, data);
            return true;
        } catch (error) {
            console.error("Error al actualizar el registro:", error.message);
            return false;
        }
    }

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

export {LocalStorageManager};