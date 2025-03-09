import {AuthManager} from "../../../../../BackEnd/services/authServices.js";
import {NotificationManager} from "../../utils/showNotifications.js";
import {ExecuteManager} from "../../../../../BackEnd/utils/execute.js";
import {Validations} from "./validations.js";

class AuthFormManager {
  constructor(formId, passwordInputId) {
    this.form = document.getElementById(formId);
    this.passwordInput = document.getElementById(passwordInputId);
  }

  // Configura los eventos del formulario
  setupEvents() {
    return ExecuteManager.execute(() => {
      if (this.form) {
        this.form.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleFormSubmit().then((r) => console.log(r));
        });
      }
      // Seleccionamos todos los botones para mostrar/ocultar contraseña
      const togglePasswordButtons = document.querySelectorAll(".toggle-password");
      togglePasswordButtons.forEach(button => {
        button.addEventListener("click", (e) => {
          // Usamos e.currentTarget para asegurarnos de obtener el botón correcto
          this.togglePasswordVisibility(e.currentTarget);
        });
      });
    }, "Éxito! Eventos configurados correctamente.", "Error! Al configurar eventos:");
  }

  // Alterna la visibilidad de la contraseña para el input correspondiente
  togglePasswordVisibility(button) {
    return ExecuteManager.execute(() => {
      // Buscamos el contenedor padre y luego el input dentro de él
      const container = button.parentElement;
      const input = container.querySelector("input");
      if (!input) return;
      const newType = input.type === "password" ? "text" : "password";
      input.type = newType;
      const icon = button.querySelector("i");
      // Alternamos las clases para cambiar el icono
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    }, "Éxito! Al cambiar visibilidad de la contraseña.", "Error! Al cambiar visibilidad de la contraseña:");
  }

  // Método para validar los campos requeridos del formulario. Retorna un objeto con los valores o null si falta algún campo.
  validateRequiredFields(fields) {
    return ExecuteManager.execute(() => {
      const values = Object.entries(fields).reduce((acc, [key, element]) => {
        acc[key] = element?.value?.trim() ?? "";
        return acc;
      }, {});
      if (Object.values(values).some((value) => !value)) {
        NotificationManager.warning("¡Atención! Todos los campos son requeridos");
        return null;
      }
      return values;
    }, "Éxito! Al validar campos.", "Error! Al validar campos:");
  }

  //  Método unificado para el envío del formulario.
  //  Si existe this.inputFields se asume que es un registro y se aplican las
  //  validaciones correspondientes, de lo contrario se ejecuta la lógica de inicio de sesión.
  async handleFormSubmit() {
    return ExecuteManager.execute(
      async () => {
        // Caso de Registro: se espera que this.inputFields esté definido
        if (this.inputFields) {
          const formData = this.validateRequiredFields(this.inputFields);
          if (!formData) return;
          if (!Validations.passwords(formData.contrasena, formData.confirmarContrasena)) return;
          if (!Validations.age(formData.fechaNacimiento)) return;
          await AuthManager.register(formData);
          setTimeout(() => {
            AuthManager.redirectTo(AuthManager._LOGIN_PATH);
          }, 1500);
        } else {
          // Caso de Inicio de Sesión
          const formData = this.validateRequiredFields({
            username: this.usernameInput,
            password: this.passwordInput
          });
          if (!formData) return;
          await AuthManager.login(formData.username, formData.password);
        }
      },
      // Mensajes según el tipo de formulario
      this.inputFields
        ? "Éxito! Registro completado."
        : "Éxito! Inicio de sesión completado.",
      this.inputFields
        ? "Error! En el proceso de registro:"
        : "Error! En el proceso de inicio de sesión:"
    );
  }

  /**  🔰 Método de inicialización del formulario. 🔰 */
  init() {
    return ExecuteManager.execute(() => {
      AuthManager.verifyAuthentication();
      this.setupEvents();
    }, "Éxito! Al inicializar el formulario de autenticación.", "Error! Al inicializar el formulario de autenticación:");
  }
}

export {AuthFormManager};