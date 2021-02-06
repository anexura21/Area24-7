/*import { Layer } from './layer';
import { Suggestion } from './suggestion';


export class App {

    private _id: number;
    private _name: string;
    private _flagActive: boolean;    
    private _lastUpdate: Date;
    private _urlIcon: string;
    private _hexColor: string;
    private _toggleCode: string;
    private _actionRadius: number;
    private _layers: Layer[];
    private _suggestions: Suggestion[];

    constructor(json: any) {
        this._id = json.id;
        this._name = json.name;
        this._hexColor = json.codigoColor;
        this._toggleCode = json.codigoToggle;
        this._flagActive = json.activo;
        this._actionRadius = json.radioAccion;
        this._lastUpdate = json.ultimaActualizacion;
        this._urlIcon = json.rutaIcono;
        this._layers = Layer.parse(json.capas);
        this._suggestions = Suggestion.parse(json.recomendaciones);
    }

    get id(): number { return this._id; }
    
    set id(id: number) { this._id = id; }

    get name(): string { return this._name; }

    set name(name: string) { this._name = name; }

    get flagActive(): boolean { return this._flagActive; }

    set flagActive(flagActive: boolean) { this._flagActive = flagActive; }

    get lastUpdate(): Date { return this._lastUpdate; }
    
    set lastUpdate(lastUpdate: Date) { this._lastUpdate = lastUpdate; }

    get urlIcon(): string { return this._urlIcon; }

    set urlIcon(urlIcon: string) { this._urlIcon = urlIcon; }
        
    get hexColor(): string { return this._hexColor; }

    set hexColor(hexColor: string) { this._hexColor = hexColor; }

    get toggleCode(): string { return this._toggleCode; }

    set toggleCode(toggleCode: string) { this._toggleCode = toggleCode; }

    get actionRadius(): number { return this._actionRadius; }

    set actionRadius(actionRadius: number) { this._actionRadius = actionRadius; }

    get layers(): Layer[] { return this._layers; }

    set layers(layers: Layer[]) { this._layers = layers; }

    get suggestions(): Suggestion[] { return this._suggestions; }

    set suggestions(suggestions: Suggestion[]) { this._suggestions = suggestions; }
    
    static parse(json: any[]): App[] {
        return json.map((item: any) => new App(item));
    }
}*/