import { AppPreferences } from './app-preferences';
import { TransportPreferences } from './transport-preferences';
import { AppLayer } from '../app-layer';

export class Preferences
{
    private _appsPreferences: AppPreferences[];
    private _transportsPreferences: TransportPreferences[];

    constructor(json?: any) {
        if (!json) {return; }

        this._appsPreferences = AppPreferences.parse(json._appsPreferences);
        this._transportsPreferences = TransportPreferences.parse(json._transportsPreferences);
    }

    get appsPreferences(): AppPreferences[] { return this._appsPreferences; }

    set appsPreferences(appsPreferences: AppPreferences[]) {
        this._appsPreferences = appsPreferences;
    }

    get transportsPreferences(): TransportPreferences[] { return this._transportsPreferences; }

    set transportsPreferences(transportsPreferences: TransportPreferences[]) {
        this._transportsPreferences = transportsPreferences;
    }

    static parseFromEntities(apps: AppLayer[], transportPreferences: TransportPreferences[]): Preferences {
        const preferences: Preferences = new Preferences();
        preferences.appsPreferences = AppPreferences.parseFromAppLayers(apps);
        preferences.transportsPreferences = transportPreferences;
        return preferences;
    }
}
