export class Municipality {

    private _id: number;
    private _name: string;
    private _centroidLat: number;
    private _centroidLng: number;
    private _polygonLineStr: string;

    constructor(json: any) {
        this._id = json.id;
        this._name = json.nombre;
        if (json.zeroPoint) {
            this._centroidLat = json.zeroPoint.lat;
            this._centroidLng = json.zeroPoint.lng;
            this._polygonLineStr = json.encodePolygon;
        }
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get name(): string { return this._name; }

    set name(name: string) { this._name = name; }

    get centroidLat(): number { return this._centroidLat; }

    set centroidLat(centroidLat: number) { this._centroidLat = centroidLat; }

    get centroidLng(): number { return this._centroidLng; }

    set centroidLng(centroidLng: number) { this._centroidLng = centroidLng; }

    get polygonLineStr(): string { return this._polygonLineStr; }

    set polygonLineStr(polygonLineStr: string) { this._polygonLineStr = polygonLineStr; }

    static parse(json: any[]): Municipality[] {
        return json.map((item: any) => new Municipality(item));
    }
}
