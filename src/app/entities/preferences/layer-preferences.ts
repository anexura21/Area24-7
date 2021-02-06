import { Layer } from '../layer';

export class LayerPreferences
{
    private _id: number;
    private _active: boolean;
    private _favorite: boolean;

    constructor(json?: any) {
        if (!json) {return; }

        this._id = json._id;
        this._active = json._active;
        this._favorite = json._favorite;
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get active(): boolean { return this._active; }

    set active(active: boolean) { this._active = active; }

    get favorite(): boolean { return this._favorite; }

    set favorite(favorite: boolean) { this._favorite = favorite; }

    static parse(json: any[]): LayerPreferences[] {
        return json.map((item: any): LayerPreferences => new LayerPreferences(item));
    }

    static parseFromLayers(layers: Layer[]): LayerPreferences[] {
        return layers.map((layer: Layer): LayerPreferences => {
            const layerPreferences: LayerPreferences = new LayerPreferences();
            layerPreferences.id = layer.id;
            layerPreferences.active = layer.active;
            layerPreferences.favorite = layer.favorite;
            return layerPreferences;
        });
    }
}
