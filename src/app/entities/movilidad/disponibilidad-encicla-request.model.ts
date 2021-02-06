export class DisponibilidadEnciclaRequest {
    
    tokenAutenticacion: string;
    idEstacion: number;
    fecha: any;


    constructor(
      tokenAutenticacion: string,
      idEstacion: any,
      fecha: any
    ) {
      this.fecha = fecha;
      this.tokenAutenticacion = tokenAutenticacion;
      this.idEstacion = idEstacion;

    }
}
