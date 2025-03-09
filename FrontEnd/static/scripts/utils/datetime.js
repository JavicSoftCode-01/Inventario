import {ExecuteManager} from "../../../../BackEnd/utils/execute.js";

class DateTimeManager {

    /**
     *  🔰 Obtiene la fecha y hora actual. 🔰
     */
    static getDateTime() {
        return ExecuteManager.execute(() => {
            const now = new Date();

            const dateOptions = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            };

            const timeOptions = {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };

            return {
                fecha: now.toLocaleDateString('es-ES', dateOptions).replace(/\//g, '-'),
                hora: now.toLocaleTimeString('es-ES', timeOptions)
            };
        }, "Fecha y hora obtenidas correctamente.", "Error al obtener fecha y hora:");
    }
}

export {DateTimeManager};