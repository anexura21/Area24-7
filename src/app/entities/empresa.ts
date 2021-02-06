import { CONFIG_ENV } from '../shared/config-env-service/const-env';


export class Empresa {
    id: number;
    razonSocial: string;
    Categoria: string;
    descripcion: string;
    descripcionMin: string;
    urllogo: string;
    Municipio: string;

    constructor( json: any  ){
        if (!json) {return; }
        this.id = json.id;
        this.razonSocial = json.razonSocial;
        this.Categoria = json.categoria;
        this.descripcion = json.descripcion;
        this.descripcionMin = '';
        this.urllogo = json.urllogo;
        this.Municipio = json.municipio;
    }

    static parse(json: any[]): Empresa[] {
        return json.map((item: any): Empresa => new Empresa(item));
    }

    static parseEmpresas(json: any[]): Empresa[] {
        return json.map((item: any): Empresa => {
        const empresa: Empresa = new Empresa(null);
        empresa.id = item.id;
        empresa.razonSocial = item.razonSocial;
        empresa.Categoria = item.categoria;
        empresa.descripcion = item.descripcion;
        empresa.urllogo = CONFIG_ENV.IMG_SERVER_URL + item.urllogo;
        empresa.Municipio = item.municipio;
        return empresa;
        });
    }


}
