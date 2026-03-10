export class Lead {
  constructor(nombre = "") {
    this.nombre = nombre;
    this.timestamp = new Date().toISOString();
  }
}