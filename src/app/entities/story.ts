import { PublicationState } from "../enums/publication-state";

export class Story {

    private _id: number;
    private _title: string;
    private _content: string;
    private _creationDate: string;
    private _publicationState: PublicationState;
    private _username: string;

    constructor(json: any) {
        if (!json) {return; }

        this._id = json.id;
        this._title = json.titulo;
        this._content = json.texto;
        this._creationDate = json.fechaCreacion;
        this._publicationState = json.estadoPublicacion;
        this._username = json.username;
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get title(): string { return this._title; }

    set title(title: string) { this._title = title; }

    get content(): string { return this._content; }

    set content(content: string) { this._content = content; }

    get creationDate(): string { return this._creationDate; }

    set creationDate(creationDate: string) { this._creationDate = creationDate; }

    get publicationState(): PublicationState { return this._publicationState; }

    set publicationState(publicationState: PublicationState) { this._publicationState = publicationState; }

    get username(): string { return this._username; }

    set username(username: string) { this._username = username; }

    static parse(json: any[]): Story[] {
        return json.map((item: any): Story => new Story(item));
    }
}
