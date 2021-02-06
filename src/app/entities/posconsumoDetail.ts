export class PosconsumoDetail {

    private _name: string;
    private _address: string;
    private _schedule: string;
    private _phone: string;
    private _email: string;
    private _description: string;
    private _environmentalLicence: string;
    private _icono: string;

    constructor(json: any) {
        if(!json) {return; }

        this._name = json.Nombre;
        this._address = json.Dirección;
        this._schedule = json.Horario;
        this._phone = json.Teléfono;
        this._email = json.Email;
        this._description = json.Descripción;
        this._environmentalLicence = json.LicenciaAmbiental;
        this._icono = json.icono;
    }

    get name(): string { return this._name; }

    set name(name: string) { this._name = name; }

    get address(): string { return this._address; }

    set address(address: string) { this._address = address; }

    get schedule(): string { return this._schedule; }

    set schedule(schedule: string) { this._schedule = schedule; }

    get phone(): string { return this._phone; }

    set phone(phone: string) { this._phone = phone; }

    get email(): string { return this._email; }

    set email(email: string) { this._email = email; }

    get description(): string { return this._description; }

    set description(description: string) { this._description = description; }

    get environmentalLicence(): string { return this._environmentalLicence; }

    set environmentalLicence(environmentalLicence: string) { this._environmentalLicence = environmentalLicence; }

    get icono(): string { return this._icono; }

    set icono(icono: string) { this._icono = icono; }

    static parce(json: any): PosconsumoDetail {
        return new PosconsumoDetail(json);
    }
}
