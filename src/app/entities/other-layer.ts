import { Layer } from './layer';

export class OtherLayer extends Layer {

    public _layerType: string;

    constructor(json: any) {
        if (!json) {return; }

        super(json);

        if (json.nombreTipoCapa) {this._layerType = json.nombreTipoCapa.toUpperCase(); }
    }

    get layerType(): string { return this._layerType; }

    set layerType(layerType: string) { this._layerType = layerType; }
}
