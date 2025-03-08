import {ExecuteManager} from "../../../../BackEnd/utils/execute.js";

class NotificationManager {

  // Propiedad getter para obtener el contenedor de notificaciones
  get container() {
    return ExecuteManager.execute(() => {
      const container = document.getElementById("notification-container");
      if (!container) console.error('Contenedor con id "notification-container" no encontrado.');
      return container;
    }, "Contenedor de notificaciones obtenido.", "Error al obtener el contenedor de notificaciones.");
  }

  // Método de instancia para mostrar una notificación
  showNotification(message, type = "success") {
    return ExecuteManager.execute(() => {
      const container = this.container;
      if (!container) throw new Error("Contenedor de notificaciones no existe.");

      const notification = document.createElement("div");
      notification.className = `notification ${type}`;
      notification.textContent = message;
      container.append(notification);

      setTimeout(() => {
        notification.classList.add("fade-out");
        notification.ontransitionend = () => notification.remove();
      }, 5000);
    }, "Notificación mostrada", "Error al mostrar la notificación");
  }

  /**
   * 🔰Muestra una notificación de éxito🔰
   * */
  static success(message) {
    new NotificationManager().showNotification(message, "success");
  }

  /**
   * 🔰Muestra una notificación de advertencia🔰
   */
  static warning(message) {
    new NotificationManager().showNotification(message, "warning");
  }

  /**
   * 🔰Muestra una notificación de error🔰
   */
  static error(message) {
    new NotificationManager().showNotification(message, "error");
  }

  /**
   * 🔰Muestra una notificación de información🔰
   */
  static info(message) {
    new NotificationManager().showNotification(message, "info");
  }
}

export {NotificationManager};