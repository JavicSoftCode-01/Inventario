/**
 * Envía los datos a Google Sheets mediante JSONP para evitar problemas de CORS.
 * @param {string} action - Acción a realizar: 'create', 'update' o 'delete'
 * @param {object} data - Objeto con los datos a sincronizar.
 * @returns {Promise} - Promesa que resuelve con el resultado de la operación
 */
function syncWithGoogleSheet(action, data) {
  // URL de tu Web App de Google Apps Script (actualiza con tu URL)
  const baseUrl = 'https://script.google.com/macros/s/AKfycbx5KnDachGl-tdx-1yeYj_HxUan8Ub-DIemrWI1mzHd8t27R1gEvie0LYwJGaYpPD2W/exec';

  // Log para depuración
  console.log(`Sincronizando con Google Sheets (JSONP) - Acción: ${action}`, data);

  return new Promise((resolve, reject) => {
    // Crear un ID único para el callback
    const callbackName = 'googleSheetsCallback_' + Date.now();

    // Convertir datos a formato URL-encoded
    const payload = encodeURIComponent(JSON.stringify({
      action: action,
      data: data
    }));

    // Crear la URL completa con los parámetros
    const url = `${baseUrl}?callback=${callbackName}&payload=${payload}`;

    // Registrar una función de callback global
    window[callbackName] = function(response) {
      console.log('Google Sheets response:', response);
      // Limpiar el script y la función después de usarla
      document.body.removeChild(script);
      delete window[callbackName];
      resolve(response);
    };

    // Crear y añadir el elemento script
    const script = document.createElement('script');
    script.src = url;
    script.onerror = function(error) {
      console.error('Error al cargar el script JSONP:', error);
      document.body.removeChild(script);
      delete window[callbackName];
      reject(new Error('Error al conectar con Google Sheets'));
    };

    // Configurar un timeout por si la solicitud nunca se completa
    const timeout = setTimeout(() => {
      console.error('Tiempo de espera agotado para la solicitud JSONP');
      document.body.removeChild(script);
      delete window[callbackName];
      reject(new Error('Tiempo de espera agotado para la solicitud a Google Sheets'));
    }, 30000); // 30 segundos de timeout

    // Modificar el callback para limpiar el timeout
    const originalCallback = window[callbackName];
    window[callbackName] = function(response) {
      clearTimeout(timeout);
      originalCallback(response);
    };

    // Añadir el script al documento
    document.body.appendChild(script);
  });
}

export { syncWithGoogleSheet };