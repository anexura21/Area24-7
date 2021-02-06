export class AccessUser {
    private  _username: string;
    private _idAplicacion: number;

    constructor() {}

    get username(): string {
        return this._username;
    }

    set username( username: string ) {
        this._username = username;
    }

    get idAplicacion(): number {
        return this._idAplicacion;
    }

    set idAplicacion( idAplicacion: number ) {
        this._idAplicacion = idAplicacion;
    }

    toJsonObject(): any {
        return {
            username: (this.username) ? this.username : '',
            idAplicacion: (this.idAplicacion) ? this.idAplicacion : 0,
        }
    }

}