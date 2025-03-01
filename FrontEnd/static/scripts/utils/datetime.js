function obtenerFechaYHora() {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    const fecha = `${anio}-${mes}-${dia}`;
  
    let horas = ahora.getHours();
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const sufijo = horas >= 12 ? "PM" : "AM";
    horas = horas % 12 || 12;
    const horaStr = `${horas}:${minutos} ${sufijo}`;
  
    return { fecha, hora: horaStr };
  }
  
  export { obtenerFechaYHora };  