
export class Vigia {

    private _id: number;
    private _idAutoridad: number;
    private _direccion: string;
    private _description: string;
    private _creationDate: string;
    private _publicationState: string;
    private _urlMedia: any[];
    private _username: string;
    private _radicado: string;
    private _lat: number;
    private _lng: number;
    private _layerId: number;
    private _nodoArbol: number;
    private _hasStories: boolean;
    private _idNodoFinal: number;
    private _idNodoRecurso: number;
    private _recorridoArbol: string[];
    private _nombreRecurso: string;
    private _nombreAfectacion: string;



    constructor(json: any) {
        if (!json) {return; }
        this._id = json.id;
        this._idAutoridad = json.idAutoridad;
        this._direccion = json.direccion;
        this._description = json.descripcion;
        this._creationDate = json.fechaReporte;
        this._publicationState = json.estado;
        this._urlMedia = json.multimedias;
        this.username = json.username;
        this._layerId = json.idCapa;
        this._nodoArbol = json.idNodoArbol;
        this._radicado = json.radicado;
        this._hasStories = json.tieneHistoria;
        this._idNodoFinal = json.idNodoFinal;
        this._idNodoRecurso = json.idNodoRecurso;
        this._recorridoArbol = json.recorridoArbol;
        this._nombreAfectacion = json.nombreAfectacion;
        this._nombreRecurso = json.nombreRecurso;
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get idNodofinal(): number { return this._idNodoFinal; }

    set idNodofinal(idNodoFinal: number) { this._idNodoFinal = idNodoFinal; }

    get idNodoRecurso(): number { return this._idNodoRecurso; }

    set idNodoRecurso(idNodoRecurso: number) { this._idNodoRecurso = idNodoRecurso; }

    get idAutoridad(): number { return this._idAutoridad; }

    set idAutoridad(idAutoridad: number) { this._idAutoridad = idAutoridad; }

    get nodoArbol(): number { return this._nodoArbol; }

    set nodoArbol(nodoArbol: number) { this._nodoArbol = nodoArbol; }

    get commonName(): string { return this._direccion; }

    set radicado(radicado: string) { this._radicado = radicado; }

    get radicado(): string { return this._radicado; }

    // tslint:disable-next-line:adjacent-overload-signatures
    set commonName(direccion: string) { this._direccion = direccion; }

    get description(): string { return this._description; }

    set description(description: string) { this._description = description; }

    get creationDate(): string { return this._creationDate; }

    set creationDate(creationDate: string) { this._creationDate = creationDate; }

    get publicationState(): string { return this._publicationState; }

    set publicationState(publicationState: string) { this._publicationState = publicationState; }

    get urlMedia(): any[] { return this._urlMedia; }

    set urlMedia(urlMedia: any[]) { this._urlMedia = urlMedia; }

    get username(): string { return this._username; }

    set username(username: string) { this._username = username; }

    get lat(): number { return this._lat; }

    set lat(lat: number) { this._lat = lat; }

    get lng(): number { return this._lng; }

    set lng(lng: number) { this._lng = lng; }

    get layerId(): number { return this._layerId; }

    set layerId(layerId: number) { this._layerId = layerId; }

    get hasStories(): boolean { return this._hasStories; }

    set hasStories(hasStories: boolean) { this._hasStories = hasStories; }

    get nombreRecurso(): string { return this._nombreRecurso; }

    set nombreRecurso(nombreRecurso: string) { this._nombreRecurso = nombreRecurso; }

    get nombreAfectacion(): string { return this._nombreAfectacion; }

    set nombreAfectacion(nombreAfectacion: string) { this._nombreAfectacion = nombreAfectacion; }

    get recorridoArbol(): string[] { return this._recorridoArbol; }

    set recorridoArbol(recorrido: string[]) { 
        this._recorridoArbol = recorrido; 
    }

    static parse(json: any[]): Vigia[] {
        return json.map((item: any): Vigia => new Vigia(item));
    }
}
