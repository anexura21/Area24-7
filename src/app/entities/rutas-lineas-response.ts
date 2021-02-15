import { Paradero } from './paradero.model';
import { Linea } from './linea.model';
import { Ruta } from './ruta.model';
import { Estacion } from './estacion.model';

export class RutasLineasResponse {

    estaciones:  Estacion[];
    rutas:  Ruta[];
    lineas: Linea[];
    paraderos: Paradero[];

  }