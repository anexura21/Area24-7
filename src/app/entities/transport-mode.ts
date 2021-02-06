export class TransportMode 
{
    private _id: number;
    private _name: string;
    private _active: boolean;
    private _urlIconEnabled: string;
    private _urlIconDisabled: string;

    constructor(json?: any) {
        if (!json) return;

        this._id = json.id;
        this._name = json.nombre;
        this._active = json.activo;
        this._urlIconEnabled = json.urlIconoActivo;
        this._urlIconDisabled = json.urlIconoInactivo;
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get name(): string { return this._name; }

    set name(name: string) { this._name = name; }

    get active(): boolean { return this._active; }

    set active(active: boolean) { this._active = active; }

    get urlIconEnabled(): string { return this._urlIconEnabled; }

    set urlIconEnabled(urlIconEnabled: string) { this._urlIconEnabled = urlIconEnabled; }

    get urlIconDisabled(): string { return this._urlIconDisabled; }

    set urlIconDisabled(urlIconDisabled: string) { this._urlIconDisabled = urlIconDisabled; }

    static parse(json: any[]): TransportMode[] {
        return json.map((item: any): TransportMode => new TransportMode(item));
    }
}
