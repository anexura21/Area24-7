import { Layer } from './layer';
import { Recommendation } from './recommendation';
import { OtherLayer } from './other-layer';
import { GeoLayer } from './geo-layer';

export class AppLayer extends Layer {

    public _color: string;
    public _recommendation: Recommendation;
    public _toggleCode: string;
    public _notification: boolean;
    public _radius: number;
    public _minRadius: number;
    public _maxRadius: number;

    constructor(json: any) {
        super(json);

        if (json == null) {return; }
        this._color = json.codigoColor;
        this._notification = json.notification;
        this._radius = json.radius;
        this._minRadius = json.minRadius;
        this._maxRadius = json.maxRadius;
        this._order = json.order;
        if (json.recomendaciones.length > 0) {this._recommendation = new Recommendation(json.recomendaciones[0]); }
    }

    get color(): string { return this._color; }

    set color(color: string) { this._color = color; }

    get toggleCode(): string { return this._toggleCode; }

    set toggleCode(toggleCode: string) { this._toggleCode = toggleCode; }

    get notification(): boolean { return this._notification; }

    set notification(notification: boolean) { this._notification = notification; }

    get radius(): number { return this._radius; }

    set radius(radius: number) { this._radius = radius; }

    get minRadius(): number { return this._minRadius; }

    set minRadius(minRadius: number) { this._minRadius = minRadius; }

    get maxRadius(): number { return this._maxRadius; }

    set maxRadius(maxRadius: number) { this._maxRadius = maxRadius; }

    get order(): number { return this._order; }

    set order(order: number) { this._order = order; }

    get recommendation(): Recommendation { return this._recommendation; }

    set recommendation(recommendation: Recommendation) { this._recommendation = recommendation; }

    static parse(json: any[]): AppLayer[] {
        return json.map((item: any): AppLayer => new AppLayer(item));
    }

    static parseApps(json: any[]): AppLayer[] {
        return json.map((item: any): AppLayer => {
            const app: AppLayer = new AppLayer(null);
            app.id = item.id;
            app.name = item.nombre;
            app.color = item.codigoColor;
            app.notification = item.notification;
            app.radius = item.radioAccion;
            app.minRadius = item.minRadius;
            app.maxRadius = item.maxRadius;
            app.order = item.order;
            app.active = item.activo;
            app.urlIcon = item.rutaIcono;
            app.toggleCode = item.codigoToggle;
            app.children = AppLayer.parseStrategy(item.capas);
            if (item.recomendaciones.length > 0) {app.recommendation = new Recommendation(item.recomendaciones[0]); }
            return app;
        });
    }

    // distinguir entre mapa y avistamiento (se debe construir servicio para tipos de avistamiento)
    // necesario para luego aplicar los filtros solo sobre las capas de avistamientos

    // mis avistamientos es una capa con su propio endpoint (quemar el id en el servicio)
    static parseStrategy(json: any[]): Layer[] {
        return json.map((item: any) => {
            switch (item.nombreTipoCapa.toUpperCase()) {

                case 'MAPA':
                case 'AVISTAMIENTO':
                case 'MAPA DE INVENTARIO DE FLORA':
                case 'MAPA DE ESTADOS':
                case 'MAPA DE AGUA':
                case 'MAPA DE CLIMA':
                case 'MAPA DE AIRE':
                case 'MIS PUBLICACIONES':
                    const geoLayer: GeoLayer = new GeoLayer(item);
                    return geoLayer;

                case 'SUBCAPAS':
                case 'MAPA DE RESIDUOS POSCONSUMO':
                    const layer: Layer = new Layer(item);
                    return layer;

                default:
                    const otherLayer: OtherLayer = new OtherLayer(item);
                    return otherLayer;
            }
        });
    }
}
