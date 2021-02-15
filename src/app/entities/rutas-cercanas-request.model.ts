export class RutasCercanasRequest {
    /*latitudOrigen: number;
    longitudOrigen: number;
    fecha: any;
    modosTransporte: any;
    radio: number;*/

    constructor(
      public fecha: string,
      public latitudOrigen: number,
      public longitudOrigen: number,
      public modosTransporte: string,
      public radio: number
    ) {
      /*this.fecha = fecha;
      this.latitudOrigen = latitudOrigen;
      this.longitudOrigen = longitudOrigen;
      this.modosTransporte = modosTransporte;
      this.radio = radio;*/
    }
}
