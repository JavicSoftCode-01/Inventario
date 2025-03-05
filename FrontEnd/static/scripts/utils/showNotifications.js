class NotificationManager {

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

export { NotificationManager };
