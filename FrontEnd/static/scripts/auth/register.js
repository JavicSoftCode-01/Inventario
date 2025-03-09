import {AuthFormManager} from "./utils/authForm.js";

class RegisterManager extends AuthFormManager {
  constructor() {
    super("registro-form", "contrasena");

    // Definición de los campos específicos para el registro
    this.inputFields = {
      nombres: document.getElementById("nombres"),
      apellidos: document.getElementById("apellidos"),
      fechaNacimiento: document.getElementById("fechaNacimiento"),
      telefono: document.getElementById("telefono"),
      nombreUsuario: document.getElementById("nombreUsuario"),
      contrasena: this.passwordInput,
      confirmarContrasena: document.getElementById("confirmarContrasena")
    };
  }
}

//Este código inicializa el `RegisterManager` cuando el contenido del documento ha sido completamente cargado.
document.addEventListener("DOMContentLoaded", () => {
    new RegisterManager().init();
});