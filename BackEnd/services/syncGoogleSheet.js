/**
 * Clase para sincronizar datos con Google Sheets mediante JSONP,
 * implementando una cola para manejar actualizaciones rápidas de manera secuencial.
 */
class GoogleSheetSync {
  /**
   * Constructor de la clase.
   * @param {string} baseUrl - URL de la aplicación web de Google Apps Script.
   * @param {number} timeout - Tiempo límite de espera en milisegundos (por defecto 30000).
   */
  constructor(baseUrl, timeout = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.queue = []; // Cola de solicitudes
    this.isProcessing = false; // Indicador de procesamiento
  }

  /**
   * Agrega una solicitud a la cola y procesa la cola si no está en proceso.
   * @param {string} action - Acción a realizar: 'create', 'update' o 'delete'.
   * @param {object} data - Objeto con los datos a sincronizar.
   * @returns {Promise} - Promesa que resuelve con el resultado de la operación.
   */
  sync(action, data) {
    return new Promise((resolve, reject) => {
      this.queue.push({ action, data, resolve, reject });
      if (!this.isProcessing) {
        this._processQueue();
      }
    });
  }

  /**
   * Procesa la cola de solicitudes de manera secuencial.
   * @private
   */
  async _processQueue() {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const { action, data, resolve, reject } = this.queue.shift();
      try {
        const response = await this._sendRequest(action, data);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }
    this.isProcessing = false;
  }

  /**
   * Envía la solicitud JSONP a Google Sheets.
   * @param {string} action - Acción a realizar.
   * @param {object} data - Datos a enviar.
   * @returns {Promise} - Promesa que resuelve con el resultado de la operación.
   * @private
   */
  _sendRequest(action, data) {
    console.log(`Sincronizando con Google Sheets (JSONP) - Acción: ${action}`, data);
    return new Promise((resolve, reject) => {
      const callbackName = `googleSheetsCallback_${Date.now()}`;
      const payload = encodeURIComponent(JSON.stringify({ action, data }));
      const url = `${this.baseUrl}?callback=${callbackName}&payload=${payload}`;

      // Crear el elemento script para JSONP.
      const script = document.createElement('script');
      script.src = url;

      // Configurar el temporizador para timeout.
      const timeoutId = setTimeout(() => {
        this._cleanupRequest(script, callbackName);
        reject(new Error('Tiempo de espera agotado para la solicitud a Google Sheets'));
      }, this.timeout);

      // Configurar el callback.
      window[callbackName] = (response) => {
        clearTimeout(timeoutId);
        this._cleanupRequest(script, callbackName);
        resolve(response);
      };

      // Manejo de errores.
      script.onerror = () => {
        clearTimeout(timeoutId);
        this._cleanupRequest(script, callbackName);
        reject(new Error('Error al conectar con Google Sheets'));
      };

      // Añadir el script al documento para disparar la solicitud.
      document.body.appendChild(script);
    });
  }

  /**
   * Limpia los recursos utilizados por la solicitud JSONP.
   * @param {HTMLElement} script - Elemento script a eliminar.
   * @param {string} callbackName - Nombre de la función callback a eliminar.
   * @private
   */
  _cleanupRequest(script, callbackName) {
    if (script.parentNode) {
      document.body.removeChild(script);
    }
    delete window[callbackName];
  }
}

export default GoogleSheetSync;