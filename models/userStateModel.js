export class UserState {

    constructor({
        waitingForName = false,
        waitingForPhone = false,
        waitingForLocation = false,
        nombre = null,
        telefono = null,
        localidad = null,
        lastTimestamp = 0
    } = {}) {

        this.waitingForName = waitingForName;
        this.waitingForPhone = waitingForPhone;
        this.waitingForLocation = waitingForLocation;

        this.nombre = nombre;
        this.telefono = telefono;
        this.localidad = localidad;

        this.lastTimestamp = lastTimestamp;
    }

}