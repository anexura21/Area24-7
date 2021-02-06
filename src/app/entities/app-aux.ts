import { AppLayer } from './app-layer';
import { Layer } from './layer';
import { Recommendation } from './recommendation';

export class AppAux {
    public id: number;
    public name: string;
    public active: boolean;
    public selected = false;
    public children: AppAux[];
    public urlIcon: string;
    public favorite: boolean;
    public order: number;
    public color: string;
    public recommendation: Recommendation;
    public toggleCode: string;
    public notification: boolean;
    public radius: number;
    public minRadius: number;
    public maxRadius: number;

    setAppAux( appLayer: AppLayer ) {
        this.id = appLayer.id;
        this.name = appLayer.name;
        this.active = appLayer.active;
        this.selected = appLayer.selected;
        appLayer.children.forEach(layer => {
            const appAux = new AppAux();
            appAux.id = layer.id;
            appAux.name = layer.name;
            appAux.active = layer.active;
            appAux.selected = layer.selected;
            appAux.urlIcon = layer.urlIcon;
            appAux.favorite = layer.favorite;
            appAux.order = layer.order;
            this.children.push(appAux);
        });
        this.urlIcon = appLayer.urlIcon;
        this.favorite = appLayer.favorite;
        this.order = appLayer.order;
        this.color = appLayer.color;
        this.recommendation = appLayer.recommendation;
        this.toggleCode = appLayer.toggleCode;
        this.notification = appLayer.notification;
        this.radius = appLayer.radius;
        this.minRadius = appLayer.minRadius;
        this.maxRadius = appLayer.maxRadius;
    }
}