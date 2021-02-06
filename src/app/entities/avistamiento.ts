import { PublicationState } from '../enums/publication-state';

export class Avistamiento {

    private _id: number;
    private _commonName: string;
    private _scientificName: string;
    private _description: string;
    private _creationDate: string;
    private _publicationState: PublicationState;
    private _urlMedia: string;
    private _username: string;
    private _lat: number;
    private _lng: number;
    private _layerId: number;
    private _hasStories: boolean;
    private _recorrido: string[];


    constructor(json: any) {
        if (!json) {return; }

        this._id = json.id;
        this._commonName = json.nombreComun;
        this._scientificName = json.nombreCientifico;
        this._description = json.descripcion;
        this._creationDate = json.fechaCreacion;
        this._publicationState = json.estadoPublicacion;
        this._urlMedia = json.rutaMultimedia;
        this.username = json.username;
        this._layerId = json.idCapa;
        this._hasStories = json.tieneHistoria;
        this._recorrido = json.recorrido;

    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get commonName(): string { return this._commonName; }

    set commonName(commonName: string) { this._commonName = commonName; }

    get scientificName(): string { return this._scientificName; }

    set scientificName(scientificName: string) { this._scientificName = scientificName; }

    get description(): string { return this._description; }

    set description(description: string) { this._description = description; }

    get creationDate(): string { return this._creationDate; }

    set creationDate(creationDate: string) { this._creationDate = creationDate; }

    get publicationState(): PublicationState { return this._publicationState; }

    set publicationState(publicationState: PublicationState) { this._publicationState = publicationState; }

    get urlMedia(): string { return this._urlMedia; }

    set urlMedia(urlMedia: string) { this._urlMedia = urlMedia; }

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

    get recorrido(): any[] { return this._recorrido; }

    set recorrido(recorrido: any[]) {
        this._recorrido = recorrido;
    }

    static parse(json: any[]): Avistamiento[] {
        return json.map((item: any): Avistamiento => new Avistamiento(item));
    }
}
