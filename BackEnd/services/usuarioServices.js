import { Usuario } from "../models/usuario.js";
import { getData, setData } from "../database/localStorage.js";

const KEY_USUARIOS = "usuarios";
const KEY_SESION_ACTUAL = "sesionActual";

// Obtener todos los usuarios
function obtenerUsuarios() {
  return getData(KEY_USUARIOS) || [];
}

// Guardar usuarios en localStorage
function guardarUsuarios(usuarios) {
  setData(KEY_USUARIOS, usuarios);
}

// Crear nuevo usuario
function registrarUsuario(datos) {
  const usuarios = obtenerUsuarios();

  // Verificar si el nombre de usuario ya existe
  const usuarioExistente = usuarios.find(u => u.nombreUsuario === datos.nombreUsuario);
  if (usuarioExistente) {
    return {
      exito: false,
      mensaje: "El nombre de usuario ya está en uso"
    };
  }

  // Crear nuevo usuario
  const nuevoUsuario = new Usuario(
    Date.now(),
    datos.nombres,
    datos.apellidos,
    datos.fechaNacimiento,
    datos.telefono,
    datos.nombreUsuario,
    datos.contrasena // En una aplicación real, deberías encriptar esta contraseña
  );

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  return {
    exito: true,
    mensaje: "Usuario registrado con éxito"
  };
}

// Iniciar sesión
function iniciarSesion(nombreUsuario, contrasena) {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(
    u => u.nombreUsuario === nombreUsuario && u.contrasena === contrasena
  );

  if (!usuario) {
    return {
      exito: false,
      mensaje: "Nombre de usuario o contraseña incorrectos"
    };
  }

  const sesionUsuario = {
    id: usuario.id,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    nombreUsuario: usuario.nombreUsuario,
    nombreCompleto: usuario.nombreCompleto,
    timestamp: Date.now() // <-- guardamos la hora actual en milisegundos
  };

  sessionStorage.setItem(KEY_SESION_ACTUAL, JSON.stringify(sesionUsuario));

  return {
    exito: true,
    mensaje: "Inicio de sesión exitoso",
    usuario: sesionUsuario
  };
}


// Verificar si hay una sesión activa
function obtenerSesionActual() {
  const sesionJSON = sessionStorage.getItem(KEY_SESION_ACTUAL);
  return sesionJSON ? JSON.parse(sesionJSON) : null;
}

// Cerrar sesión
function cerrarSesion() {
  sessionStorage.removeItem(KEY_SESION_ACTUAL);
  return { exito: true, mensaje: "Sesión cerrada" };
}

// Verificar si un usuario es propietario de un registro
// function esUsuarioPropietario(usuarioId, autorizado) {
//   const sesion = obtenerSesionActual();
//   if (!sesion) return false;
//
//   // Verificamos si el usuario coincide con quien autorizó el registro
//   return sesion.nombreCompleto === autorizado;
// }
// Verificar si un usuario es propietario de un registro
function esUsuarioPropietario(usuarioId, autorizado) {
  const sesion = obtenerSesionActual();
  if (!sesion) return false;

  // Verificamos si el nombre de usuario coincide con quien autorizó el registro
  return sesion.nombreUsuario === autorizado;
}

export {
  obtenerUsuarios,
  registrarUsuario,
  iniciarSesion,
  obtenerSesionActual,
  cerrarSesion,
  esUsuarioPropietario,
};