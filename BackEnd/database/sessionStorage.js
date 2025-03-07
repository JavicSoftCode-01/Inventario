class SessionStorageManager {

    static setData(key, value) {
        try {
            // Si el valor es un objeto, lo convierte a JSON; de lo contrario, lo almacena directamente.
            const data = typeof value === "object" ? JSON.stringify(value) : value;
            sessionStorage.setItem(key, data);
        } catch (error) {
            console.error("Error al guardar datos en sessionStorage:", error.message);
        }
    }

    static getData(key) {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            // Si ocurre un error al parsear, retorna el dato sin parsear.
            return sessionStorage.getItem(key);
        }
    }

    static removeData(key) {
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error("Error al eliminar datos de sessionStorage:", error.message);
        }
    }

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
            users[index] = {...users[index], ...updatedData};
            SessionStorageManager.setData("users", users);
            return true;
        } catch (error) {
            console.error("Error al actualizar usuario:", error.message);
            return false;
        }
    }
}

export {SessionStorageManager};