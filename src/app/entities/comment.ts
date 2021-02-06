import { PublicationState } from '../enums/publication-state';

export class Comment {

    private _id: number;
    private _creationDate: string;
    private _publicationState: PublicationState;
    private _content: string;
    private _username: string;
    private _idUser: number;
    private _idReporteVigia: number;
    fechaCreacion: any;

    constructor(json: any) {

        if (!json) {return; }
        this._id = json.id;
        this._content = json.descripcion;
        this._creationDate = json.fechaCreacion;
        this._publicationState = json.estadoPublicacion;
        this._username = json.username,
        this._idUser = json.idUsuario;
        this._idReporteVigia = json.idReporteVigia;
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get idUser(): number { return this._idUser; }

    set idUser(idUser: number) { this._idUser = idUser; }

    get idReporteVigia(): number { return this._idReporteVigia; }

    set idReporteVigia(idReporteVigia: number) { this._idReporteVigia = idReporteVigia; }

    get content(): string { return this._content; }

    set content(content: string) { this._content = content; }

    get creationDate(): string { return this._creationDate; }

    set creationDate(creationDate: string) { this._creationDate = creationDate; }

    get publicationState(): PublicationState { return this._publicationState; }

    set publicationState(publicationState: PublicationState) { this._publicationState = publicationState; }

    get username(): string { return this._username; }

    set username(username: string) { this._username = username; }

    static parse(json: any[]): Comment[] {
        return json.map((item: any): Comment => new Comment(item));
    }
}
