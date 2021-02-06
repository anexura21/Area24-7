import { CONFIG_ENV } from '../shared/config-env-service/const-env';


export class Producto {
    id: number;
    urlFotoEmprendedor: string;
    urlinstagram: string;
    urlfacebook: string;
    urlweb: string;
    email: string;
    telefono1: string;
    telefono2: string;
    direccion: string;
    nombreProducto: string;
    descripcionProducto: string;
    urlImagen: string;
    valorUnidad: number;

    constructor(json: any) {
        if (!json){ return; }
        this.id = json.id;
        this.urlFotoEmprendedor = json.urlFotoEmprendedor;
        this.urlinstagram = json.urlinstagram;
        this.urlfacebook = json.urlfacebook;
        this.urlweb = json.urlweb;
        this.email = json.email;
        this.telefono1 = json.telefono1;
        this.telefono2 = json.telefono2;
        this.direccion = json.direccion;
        this.nombreProducto = json.nombreProducto;
        this.descripcionProducto = json.descripcionProducto;
        this.urlImagen = json.urlImagen;
        this.valorUnidad = json.valorUnidad;
    }

    static parse(json: any[]) {
        return json.map((item: any): Producto => new Producto(item));
    }

    static parseProductos(json: any[]) {
        return json.map((item: any): Producto => {
            const producto: Producto = new Producto(null);
            producto.id = item.id;
            producto.urlFotoEmprendedor =
                    item.urlFotoEmprendedor ? CONFIG_ENV.IMG_SERVER_URL + item.urlFotoEmprendedor : undefined;
            producto.urlinstagram = item.urlinstagram;
            producto.urlfacebook = item.urlfacebook;
            producto.urlweb = item.urlweb;
            producto.email = item.email;
            producto.telefono1 = item.telefono1;
            producto.telefono2 = item.telefono2;
            producto.direccion = item.direccion;
            producto.nombreProducto = item.nombreProducto;
            producto.descripcionProducto = item.descripcionProducto;
            producto.urlImagen = CONFIG_ENV.IMG_SERVER_URL + item.urlImagen;
            producto.valorUnidad = item.valorUnidad;
            return producto;
        });
    }
}
