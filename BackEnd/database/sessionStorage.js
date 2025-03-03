// BackEnd/database/sessionStorage.js

// Guarda un objeto en sessionStorage como JSON
function setSessionData(key, value) {
    if (typeof value === "object") {
      sessionStorage.setItem(key, JSON.stringify(value));
    } else {
      sessionStorage.setItem(key, value);
    }
  }
  
  // Obtiene un objeto desde sessionStorage (parseado de JSON)
  function getSessionData(key) {
    const data = sessionStorage.getItem(key);
    try {
      return JSON.parse(data);
    } catch (error) {
      return data; // si no se puede parsear, retorna tal cual
    }
  }
  
  // Elimina un item del sessionStorage
  function removeSessionData(key) {
    sessionStorage.removeItem(key);
  }
  
  export { setSessionData, getSessionData, removeSessionData };
  