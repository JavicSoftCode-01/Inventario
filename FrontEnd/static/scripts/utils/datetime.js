class DateTimeManager {

  static getDateTime() {
    try {
      // Crear un objeto Date para obtener la fecha y hora actual
      const now = new Date();

      // Formatear la fecha (YYYY-MM-DD)
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0"); // Los meses inician en 0
      const day = String(now.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      // Formatear la hora en formato de 12 horas con sufijo AM/PM
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const suffix = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // Convertir la hora al formato de 12 horas
      const formattedTime = `${hours}:${minutes} ${suffix}`;

      // Retornar un objeto con la fecha y la hora formateadas
      return { fecha: formattedDate, hora: formattedTime };
    } catch (error) {
      // Capturar errores y mostrar mensaje en la consola
      console.error("Error al obtener la fecha y hora:", error.message);
      // Retornar un objeto con valores vacíos para evitar que se caiga la aplicación
      return { fecha: "", hora: "" };
    }
  }
}

export { DateTimeManager };
