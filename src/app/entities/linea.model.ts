export class Linea {

    idLinea: number;
    descripcion: string;
    coordenadas: any[];
    primerPunto: any[];
    ultimoPunto: any[];
    horarios: any[];
    frecuenciaMinimaPicoAm: number;
    frecuenciaMinimaVallerDiurno: number;
    frecuenciaMinimaVallerNocturno: number;
    frecuenciaMinimaPicoPm: number;
    intervaloMaximoPicoAm: number;
    intervaloMaximoValleDiurno: number;
    intervaloMaximoValleNocturno: number;
    intervaloMaximoPicoPm: number;
    horaInicioOperacion: number;
    horaFinOperacion: number;
    valorTarifa: number;
    idModoLinea: number;
    nombreModoLinea: string;
    checked: boolean;
    flightPath: any;
    empresa: string;
    estaciones: any[];
}
