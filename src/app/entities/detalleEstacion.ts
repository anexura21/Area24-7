export class DetalleEstacion {

    private _nombre: string;
    private _municipio: string;
    private _estado: string;
    private _subcuenca: string;
    private _icono: string;
    private _descripcionAire: string;
    private _descripcionAgua: string;
    private _interpretacion: string;
    private _recomendaciones: string;
    private _fecha: string;
    private _hora: string;
    private _listaRecomendaciones: Array<any>;


    constructor(json: any) {
        this._nombre = json.nombre;
        this._municipio = json.municipio;
        this._estado = json.estado;
        this._subcuenca = json.subcuenca;
        this._icono = json.icono;
        this._descripcionAire = json.descripcionAire;
        this._descripcionAgua = json.descripcionAgua;
        this._interpretacion = json.interpretacion;
        this._recomendaciones = json.recomendaciones;
        this._fecha = json.fecha;
        this._hora = json.hora;
        this._listaRecomendaciones = json.listaRecomendaciones;
    }

    get nombre(): string { return this._nombre; }

    set nombre(nombre: string) { this._nombre = nombre; }

    get municipio(): string { return this._municipio; }

    set municipio(municipio: string) { this._municipio = municipio; }

    get estado(): string { return this._estado; }

    set estado(estado: string) { this._estado = estado; }

    get subcuenca(): string { return this._subcuenca; }

    set subcuenca(subcuenca: string) { this._subcuenca = subcuenca; }

    get icono(): string { return this._icono; }

    set icono(icono: string) { this._icono = icono; }

    get descripcionAire(): string { return this._descripcionAire; }

    set descripcionAire(descripcionAire: string) { this._descripcionAire = descripcionAire; }

    get descripcionAgua(): string { return this._descripcionAgua; }

    set descripcionAgua(descripcionAgua: string) { this._descripcionAgua = descripcionAgua; }

    get interpretacion(): string { return this._interpretacion; }

    set interpretacion(interpretacion: string) { this._interpretacion = interpretacion; }

    get recomendaciones(): string { return this._recomendaciones; }

    set recomendaciones(recomendaciones: string) { this._recomendaciones = recomendaciones; }

    get fecha(): string { return this._fecha; }

    set fecha(fecha: string) { this._fecha = fecha; }

    get hora(): string { return this._hora; }

    set hora(hora: string) { this._hora = hora; }

    get listaRecomendaciones(): Array<any> { return this._listaRecomendaciones; }

    set listaRecomendaciones(listaRecomendaciones: Array<any>) { this._listaRecomendaciones = listaRecomendaciones; }


    getParseName(): string {

        return;
    }

    getParseSubCuenca(): string {
        const nombreSubCuenca = this.subcuenca;
        nombreSubCuenca.replace('Q. ', 'Quebrada');

        return nombreSubCuenca;
    }

    getParseAireDescription(): Array<any> {
        const aireDescription: Array<any> = [];

        const nombre = this.descripcionAire.split(' | ');

        nombre.forEach((element) => {
            aireDescription.push(element);
        });

        return aireDescription;
    }

    /* static parse(json: any[]): Department[] {
        return json.map((item: any) => new Department(item));
    } */


}
