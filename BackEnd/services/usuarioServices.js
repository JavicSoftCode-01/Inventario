import {Usuario} from "../models/usuario.js";
import {SessionStorageManager} from "../database/sessionStorage.js";

class UserManager {
    // Constantes para claves de sessionStorage
    static #KEY_USERS = "users";
    static #KEY_CURRENT_SESSION = "currentSession";

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

    static getCurrentSession() {
        return SessionStorageManager.getData(this.#KEY_CURRENT_SESSION);
    }

    static getCurrentUserFullName() {
        const session = this.getCurrentSession();
        return session
            ? `${session.nombres} ${session.apellidos}`
            : "Desconocido";
    }

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

    /*
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

export {UserManager};