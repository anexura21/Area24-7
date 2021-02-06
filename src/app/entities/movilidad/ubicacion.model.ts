export enum MODOS_BUSQUEDA {
    PREDICCION_GOOGLE,
    RUTAS_Y_LINEAS
}

export class Ubicacion {

    public descripcion: string;
    public modoBusqueda: MODOS_BUSQUEDA;
    public txtPlaceholder: any;
    public prediccion: any;
    public latitud: number;
    public longitud: number;
    public cbDescripcionChange: any;

    constructor() {
    }

}
