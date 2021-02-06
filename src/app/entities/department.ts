import { Municipality } from './municipality';

export class Department {

    private _id: number;
    private _name: string;
    private _municipalities: Municipality[];

    constructor(json: any) {
        this._id = json.id;
        this._name = json.nombre;
        this._municipalities = Municipality.parse(json.municipios);
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get name(): string { return this._name; }

    set name(name: string) { this._name = name; }

    get municipalities(): Municipality[] { return this._municipalities; }

    set municipalities(municipalities: Municipality[]) { this._municipalities = municipalities; }

    static parse(json: any[]): Department[] {
        return json.map((item: any) => new Department(item));
    }
}
