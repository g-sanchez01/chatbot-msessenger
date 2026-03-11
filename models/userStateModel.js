export class UserState {

  constructor({
    waitingForName = false,
    nombre = null,
    lastTimestamp = 0
  } = {}) {

    this.waitingForName = waitingForName;
    this.nombre = nombre;
    this.lastTimestamp = lastTimestamp;

  }

}