import {AuthFormManager} from "./utils/authForm.js";

class LoginManager extends AuthFormManager {
  constructor() {
    super("login-form", "contrasena");

    // Definición de los campos específicos para el inicio de sesión
    this.usernameInput = document.getElementById("nombreUsuario");
  }
}

//Este código inicializa el `LoginManager` cuando el contenido del documento ha sido completamente cargado.
document.addEventListener("DOMContentLoaded", () => {
  new LoginManager().init();
});