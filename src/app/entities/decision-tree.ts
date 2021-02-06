export class DecisionTree {

    private _id: number;
    private _idFormulario: number;
    private _idParent: number;
    private _order: number;
    private _name: string;
    private _alias: string;
    private _description: string;
    private _tipoAdjunto: string;
    private _listaMultimedia: any[];
    private _instructions: string;
    private _detailedInstructions: string;
    private _formatMedia: string;
    private _urlMedia: string;
    private _flgChildrenDropdown: boolean;
    private _parent: DecisionTree;
    private _children: DecisionTree[];
    private _hasChildren: boolean;
    private _autoridadPorMunicipio: boolean;


    constructor(json?: any) {
        if (!json) {return; }
        this._id = json.id;
        this._order = json.orden;
        this._tipoAdjunto = json.tipoAdjunto;
        this._idFormulario = json.idFormulario;
        this._idParent = json.idPadre;
        this._name = json.nombre;
        this._alias = json.alias;
        this._flgChildrenDropdown = json.flagHijosDropdown;
        this._instructions = json.instrucciones;
        this._detailedInstructions = json.instruccionesDetalladas;
        this._description = json.descripcion;
        this._formatMedia = json.formatoMedia;
        this._urlMedia = json.urlMediaSeleccionada;
        this._hasChildren = json.tieneHijos;
        this._autoridadPorMunicipio = json.autoridadPorMunicipio;

        this.listaMultimedia = json.listaMultimedia;
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get order(): number { return this._order; }

    set order(order: number) { this._order = order; }

    get idFormulario(): number { return this._idFormulario; }

    set idFormulario(idFormulario: number) { this._idFormulario = idFormulario; }

    get idPadre(): number { return this._idParent; }

    set idPadre(idPadre: number) { this._idParent = idPadre; }

    get name(): string { return this._name; }

    set name(name: string) { this._name = name; }

    get tipoAdjunto(): string { return this._tipoAdjunto; }

    set tipoAdjunto(tipoAdjunto: string) { this.tipoAdjunto = tipoAdjunto; }

    get alias(): string { return this._alias; }

    set alias(alias: string) { this._alias = alias; }

    get description(): string { return this._description; }

    set description(description: string) { this._description = description; }

    get instructions(): string { return this._instructions; }

    set instructions(instructions: string) { this._instructions = instructions; }

    get detailedInstructions(): string { return this._detailedInstructions; }

    set detailedInstructions(detailedInstructions: string) { this._detailedInstructions = detailedInstructions; }

    get formatMedia(): string { return this._formatMedia; }

    set formatMedia(formatMedia: string) { this._formatMedia = formatMedia; }

    get urlMedia(): string { return this._urlMedia; }

    set urlMedia(urlMedia: string) { this._urlMedia = urlMedia; }

    get hasChildren(): boolean { return this._hasChildren; }

    set hasChildren(hasChildren: boolean) { this._hasChildren = hasChildren; }

    get autoridadPorMunicipio(): boolean { return this._autoridadPorMunicipio; }

    set autoridadPorMunicipio(autoridadPorMunicipio: boolean) { this._autoridadPorMunicipio = autoridadPorMunicipio; }

    get flgChildrenDropdown(): boolean { return this._flgChildrenDropdown; }

    set flgChildrenDropdown(flgChildrenDropdown: boolean) { this._flgChildrenDropdown = flgChildrenDropdown; }

    get parent(): DecisionTree { return this._parent; }

    set parent(parent: DecisionTree) { this._parent = parent; }

    get children(): DecisionTree[] { return this._children; }

    set children(children: DecisionTree[]) {
        this._children = children;
        this._children.forEach((child: DecisionTree): void => {
            child.parent = this;
        });
    }

    get listaMultimedia(): any[] { return this._listaMultimedia; }

    set listaMultimedia(multimedia: any[]) {
        this._listaMultimedia = multimedia;
    }

    static parse(json: any[]): DecisionTree[] {
        return json.map((item: any): DecisionTree => new DecisionTree(item));
    }
}
