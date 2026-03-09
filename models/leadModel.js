export class Lead {
  constructor() {
    this.nombre = "";
    this.telefono = "";
    this.ciudad = "";
    this.timestamp = new Date().toISOString();
  }

  isComplete() {
    return this.nombre && this.telefono && this.ciudad;
  }
}