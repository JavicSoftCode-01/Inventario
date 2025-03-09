class ExecuteManager {

  /**
   *  🔰Método para ejecutar operaciones con manejo de errores. 🔰
   */
  static execute(callback, successMsg, errorMsg) {
    try {
      const result = callback();
      if (successMsg) console.log(successMsg);
      return result;
    } catch (error) {
      console.error(`${errorMsg} ${error.message}`);
      return null;
    }
  }
}

export {ExecuteManager};