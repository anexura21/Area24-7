import { TransportMode } from "../transport-mode";

export class TransportPreferences 
{
    private _id: number;
  //  private _name: string;
    private _active: boolean;
    //private _urlIconEnabled: string;
    //private _urlIconDisabled: string;

    constructor(json?: any) {
        if (!json) {return; }

        this._id = json._id;
      //  this._name = json._name;
        this._active = json._active;
        // this._urlIconEnabled = json._urlIconEnabled;
    //    this._urlIconDisabled = json._urlIconDisabled;
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }
/*
    get name(): string { return this._name; }

    set name(name: string) { this._name = name; }
*/
    get active(): boolean { return this._active; }

    set active(active: boolean) { this._active = active; }
/*
    get urlIconEnabled(): string { return this._urlIconEnabled; }

    set urlIconEnabled(urlIconEnabled: string) { this._urlIconEnabled = urlIconEnabled; }

    get urlIconDisabled(): string { return this._urlIconDisabled; }

    set urlIconDisabled(urlIconDisabled: string) { this._urlIconDisabled = urlIconDisabled; }
*/
    /*
    stringifyToDefault(): string {
        let object = {
              id: this.id
            , nombre: this.name
            , activo: this.active
            , icono: this.icon
            , iconOn: this.iconOn
            , iconOff: this.iconOff
        };
        return JSON.stringify(object);
    }
*/
    static parse(json: any[]): TransportPreferences[] {
        return json.map((item: any): TransportPreferences => new TransportPreferences(item));
    }

    static transportModeToTransportPreference(transportMode: TransportMode): TransportPreferences {
        const transportPreferences: TransportPreferences = new TransportPreferences();
        transportPreferences.id = transportMode.id;
        transportPreferences.active = transportMode.active;
        return transportPreferences;
    }

    static projectTransportModesToPreferences(transportModes: TransportMode[]): TransportPreferences[] {
        return transportModes.map((transportMode: TransportMode): TransportPreferences => {
            return TransportPreferences.transportModeToTransportPreference(transportMode);
        });
    }

    /*
    static parseFromDefault(json: any[]): TransportPreferences[] {
        return json.map((item: any): TransportPreferences => {
            let transportPreferences: TransportPreferences = new TransportPreferences();
            transportPreferences.id = item.id;
            transportPreferences.name = item.nombre;
            transportPreferences.active = item.activo;
            transportPreferences.icon = item.icono;
            transportPreferences.iconOn = item.iconOn;
            transportPreferences.iconOff = item.iconOff;
            return transportPreferences;
        });
    }*/

    /*
    static parseToDefault(transportsPreferences: TransportPreferences[]): any[] {
        return transportsPreferences.map((transportPreferences: TransportPreferences): any => {
            let object = {
                  id: transportPreferences.id
                , nombre: transportPreferences.name
                , activo: transportPreferences.active
                , icono: transportPreferences.icon
                , iconOn: transportPreferences.iconOn
                , iconOff: transportPreferences.iconOff
            };
            return object;
        });
    }*/
}
