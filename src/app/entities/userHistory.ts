
import { DatePipe } from '@angular/common';

export class UserHistory{

    private _id: number;
    private _formId: number;
    private _dateCreate: string;
    private _color: string;
    private _descriptionLevel: string;
    private _result: number;
    private _calculatedUnit: string;
    private _urlIcon: string;
    private _class: string;
    private datePipe: DatePipe = new DatePipe('en-US');

    constructor(json: any) {
        if (!json) {return; }
        this._id = json.id;
        this._formId = json.formularioId;
        // this._dateCreate = moment(json.fechaCreacion).format('DD/MM/YYYY hh:mm a');
        this._dateCreate = this.datePipe.transform(json.fechaCreacion, 'dd/MM/yyyy, h:mm:ss a');
        this._color = json.color;
        this._descriptionLevel = json.descripcion;
        this._result = json.calculo;
        this._calculatedUnit = json.unidadCalculo;
        this._urlIcon = json.urlIcono;
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get formId(): number { return this._formId; }

    set formId(formId: number) { this._formId = formId; }

    get dateCreate(): string { return this._dateCreate; }

    set dateCreate(dateCreate: string) { this._dateCreate = dateCreate; }

    get color(): string { return this._color; }

    set color(color: string) { this._color = color; }

    get descriptionLevel(): string { return this._descriptionLevel; }

    set descriptionLevel(descriptionLevel: string) { this._descriptionLevel = descriptionLevel; }

    get result(): number { return this._result; }

    set result(result: number) { this._result = result; }

    get calculatedUnit(): string { return this._calculatedUnit; }

    set calculatedUnit(calculatedUnit: string) { this._calculatedUnit = calculatedUnit; }

    get urlIcon(): string { return this._urlIcon; }

    set urlIcon(urlIcon: string) { this._urlIcon = urlIcon; }

    get class(): string { return this._class; }

    set class(value: string) { this._class = value; }

    static parse(json: any[]): UserHistory[] {
        return json.map((item) => new UserHistory(item));
    }
}
