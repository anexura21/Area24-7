import { Linea } from './linea.model';
import { Ruta } from './ruta.model';
import { Paradero } from './paradero.model';
import { Estacion } from './estacion.model';
export class RutasCercanasReponse {
    estaciones: Estacion[];
    rutas: Ruta[];
    lineas: Linea[];
    puntosCivica: any[];
    paraderos: Paradero[];
    ciclovias: any[];
    puntosTarjetaCivica: any[];

}