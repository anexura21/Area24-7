import { LayerPreferences } from './layer-preferences';
import { AppLayer } from '../app-layer';

export class AppPreferences
{
    private _id: number;
    private _active: boolean;
    private _layersPreferences: LayerPreferences[];
    private _notification: boolean;
    private _radius: number;
    private _order: number;

    constructor(json?: any) {
        if (!json) {return; }

        this._id = json._id;
        this._active = json._active;
        this._notification = json._notification;
        this._radius = json._radius;
        this._order = json._order;
        this._layersPreferences = LayerPreferences.parse(json._layersPreferences);
    }

    get id(): number { return this._id; }

    set id(id: number) { this._id = id; }

    get active(): boolean { return this._active; }

    set active(active: boolean) { this._active = active; }

    get notification(): boolean { return this._notification; }

    set notification(notification: boolean) { this._notification = notification; }

    get actionRadius(): number { return this._radius; }

    set actionRadius(radius: number) { this._radius = radius; }

    get order(): number { return this._order; }

    set order(order: number) { this._order = order; }

    get layersPreferences(): LayerPreferences[] { return this._layersPreferences; }

    set layersPreferences(layersPreferences: LayerPreferences[]) { this._layersPreferences = layersPreferences; }

    static parse(json: any[]): AppPreferences[] {
        return json.map((item: any): AppPreferences => new AppPreferences(item));
    }

    static parseFromAppLayers(apps: AppLayer[]): AppPreferences[] {
        return apps.map((app: AppLayer): AppPreferences => {
            const appPreferences: AppPreferences = new AppPreferences();
            appPreferences.id = app.id;
            appPreferences.active = app.active;
            appPreferences.notification = app.notification;
            appPreferences._radius = app.radius;
            appPreferences._order = app.order;
            appPreferences.layersPreferences = LayerPreferences.parseFromLayers(app.children);
            return appPreferences;
        });
    }

    static appLayerToAppPreferences(app: AppLayer): AppPreferences {
        const appPreferences: AppPreferences = new AppPreferences();
        appPreferences.id = app.id;
        appPreferences.active = app.active;
        appPreferences.notification = app.notification;
        appPreferences._radius = app.radius;
        appPreferences._order = app.order;
        appPreferences.layersPreferences = LayerPreferences.parseFromLayers(app.children);
        return appPreferences;
    }

    static projectAppsToPreferences(apps: AppLayer[]): AppPreferences[] {
        return apps.map((app: AppLayer): AppPreferences => {
            return AppPreferences.appLayerToAppPreferences(app);
        });
    }
}
