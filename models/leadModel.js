export class Lead {
  constructor(nombre = "", telefono = "", ciudad = "") {
    this.nombre = nombre;
    this.telefono = telefono;
    this.ciudad = ciudad;
    this.timestamp = new Date().toISOString();
  }
}