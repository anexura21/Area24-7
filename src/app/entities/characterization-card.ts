export class CharacterizationCard {

    private _municipality: string;
    private _land: string;

    constructor(json: any) { 
        if (!json) {return; }

        this._municipality = json.nombreMunicipio;
        this._land = json.tipoSuelo;
    }

    get municipality(): string { return this._municipality; }

    set municipality(municipality: string) { this._municipality = municipality; }

    get land(): string { return this._land; }

    set land(land: string) { this._land = land; }
}
