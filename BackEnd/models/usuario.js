class Usuario {
  constructor(
    id,
    nombres,
    apellidos,
    fechaNacimiento,
    telefono,
    nombreUsuario,
    contrasena
  ) {
    this.id = id;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.fechaNacimiento = fechaNacimiento;
    this.telefono = telefono;
    this.nombreUsuario = nombreUsuario;
    this.contrasena = contrasena;
  }

  get nombreCompleto() {
    return `${this.nombres} ${this.apellidos}`;
  }
}

export { Usuario };