import {ExecuteManager} from "../../../../../BackEnd/utils/execute.js";
import {NotificationManager} from "../../../scripts/utils/showNotifications.js";

class Validations {

  static passwords(password, confirmPassword) {
    return ExecuteManager.execute(() => {
      const isValid = password === confirmPassword;
      if (!isValid) {
        NotificationManager.error("Las contraseñas no coinciden");
      }
      return isValid;
    }, "Exito! Contraseñas validadas.", "Error! Al validar las contraseñas:");
  }

  static age(birthDate) {
    return ExecuteManager.execute(() => {
      const today = new Date();
      const birthDateTime = new Date(birthDate);
      const age = today.getFullYear() - birthDateTime.getFullYear();
      const monthDiff = today.getMonth() - birthDateTime.getMonth();

      const isValid = age > 18 || (age === 18 && monthDiff >= 0);
      if (!isValid) {
        NotificationManager.warning("¡Atención! Debes ser mayor de 18 años para registrarte");
      }
      return isValid;
    }, "Exito! Edad validada.", "Error! Al validar la edad:");
  }
}

export {Validations};