import { Department } from './department';

export class Country {

    private _id: number;
    private _name: string;
    private _departments: Department[];

    constructor(json: any) {
        this._id = json.id;
        this._name = json.nombre;
        this._departments = Department.parse(json.departamentos);
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get name(): string { return this._name; }

    set name(name: string) { this._name = name; }

    get departments(): Department[] { return this._departments; }

    set departments(departments: Department[]) { this._departments = departments; }

    static parse(json: any[]): Country[] {
        return json.map((item: any) => new Country(item));
    }
}
