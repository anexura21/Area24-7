export class Report {

    private _id;
    private _nombre;
    private _url;

    constructor(json: any) {
        if (!json) {return; }
        this._id = json.id;
        this._nombre = json.nombre;
        this._url = json.url;
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get nombre(): string { return this._nombre; }

    set nombre(nombre: string) { this._nombre = nombre; }

    get url(): string { return this._url; }

    set url( url: string ) { this._url = url; }

    static parse(json: any[]): Report[] {
        return json.map((item: any) => new Report(item));
    }

    static parseReports( json: any[] ): Report[] {
        return json.map((item: any): Report => {
            const reporte: Report = new Report( null );
            reporte.id = item.id;
            reporte.nombre =  item.nombre;
            reporte.url = item.url;
            return reporte;
        });
    }

}
