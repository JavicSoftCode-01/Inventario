/**
 * Muestra una notificación personalizada.
 */
//function showNotification(message, type = "success") {
//    const container = document.getElementById("notification-container");
//    if (!container) return;
//    const notification = document.createElement("div");
//    notification.className = `notification ${type}`;
//    notification.innerText = message;
//    container.appendChild(notification);
//    setTimeout(() => {
//      notification.classList.add("fade-out");
//      notification.addEventListener("transitionend", () => {
//        notification.remove();
//      });
//    }, 5000);
//  }
//
//  export { showNotification };

// NotificationManager.js

/**
 * Clase para manejar las notificaciones en la web.
 */
class NotificationManager {
  /**
   * Constructor de la clase NotificationManager.
   * @param {string} containerId - ID del contenedor de notificaciones (por defecto "notification-container").
   */
  constructor(containerId = "notification-container") {
    // Asigna el ID del contenedor
    this.containerId = containerId;
    // Obtiene el contenedor desde el DOM
    this.container = document.getElementById(this.containerId);
    // Verifica si el contenedor existe y, de lo contrario, muestra un error en la consola
    if (!this.container) {
      console.error(`Error: Contenedor con id "${this.containerId}" no encontrado.`);
    }
  }

  /**
   * Muestra una notificación personalizada.
   * @param {string} message - Mensaje a mostrar.
   * @param {string} [type="success"] - Tipo de notificación (por defecto "success").
   */
  showNotification(message, type = "success") {
    try {
      // Verifica si el contenedor existe
      if (!this.container) {
        throw new Error("Contenedor de notificaciones no existe.");
      }
      // Crea el elemento para la notificación
      const notification = document.createElement("div");
      // Asigna las clases de estilo según el tipo de notificación
      notification.className = `notification ${type}`;
      // Establece el mensaje de la notificación
      notification.innerText = message;
      // Agrega la notificación al contenedor
      this.container.appendChild(notification);

      // Después de 5 segundos, inicia la animación de desaparición
      setTimeout(() => {
        notification.classList.add("fade-out");
        // Al finalizar la transición, elimina la notificación del DOM
        notification.addEventListener("transitionend", () => {
          notification.remove();
        });
      }, 5000);
    } catch (error) {
      // Captura y muestra cualquier error que ocurra durante la ejecución
      console.error("Error al mostrar la notificación:", error.message);
    }
  }
}

// Exporta la clase para ser utilizada en otros módulos
export { NotificationManager };
