export class Recommendation
{
    private _name: string;
    private _description: string;

    constructor(json: any) {
        this._name = json.nombre;
        this._description = json.descripcion;
    }

    get name(): string { return this._name; }

    set name(name: string) { this._name = name; }

    get description(): string { return this._description; }

    set description(description: string) { this._description = description; }
}