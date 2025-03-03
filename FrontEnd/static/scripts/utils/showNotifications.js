/**
 * Muestra una notificación personalizada.
 */
function showNotification(message, type = "success") {
    const container = document.getElementById("notification-container");
    if (!container) return;
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerText = message;
    container.appendChild(notification);
    setTimeout(() => {
      notification.classList.add("fade-out");
      notification.addEventListener("transitionend", () => {
        notification.remove();
      });
    }, 5000);
  }

  export { showNotification };
