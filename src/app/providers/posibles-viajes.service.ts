import { MessageService } from './message.service';
import { WsMovilidadService } from './movilidad/ws-movilidad.service';
import { LayerService } from './layer.service';
import { Injectable } from '@angular/core';
import { TransportMode } from '../entities/transport-mode';
import { Common } from '../shared/utilidades/common.service';

@Injectable({
  providedIn: 'root'
})
export class PosiblesViajesService {

  public origen = {
    lat: 0,
    lon: 0,
    descripcion: ''
  };

  public destino = {
    lat: 0,
    lon: 0,
    descripcion: ''
  };
  private preferenciasTransportes: any[];

  constructor(public wsMovilidad: WsMovilidadService,
              private layerProvider: LayerService,
              private messageProvider: MessageService,
              public common: Common) {
    this.layerProvider.transportModesChange$.subscribe(
      (transportsPreferences: TransportMode[]) => {
          this.preferenciasTransportes = transportsPreferences;
      }
    );
  }

  // setear posiciones
  cambiarPosiciones(origen1, destino1): void {
    this.origen.lat = origen1.latitud;
    this.origen.lon = origen1.longitud;
    this.origen.descripcion = origen1.descripcion;

    this.destino.lat = destino1.latitud;
    this.destino.lon = destino1.longitud;
    this.destino.descripcion = destino1.descripcion;
  }

  obtenerviajesSugeridos(isMovilidad: boolean, modoTransporte?: string) {
    // debugger;
    if (!isMovilidad){
      this.origen.lat = 0.1; }
    if (this.origen.lon === this.destino.lon && this.origen.lat === this.destino.lat){
      return new Promise((resolve, reject) => {
        this.messageProvider.getByNombreIdentificador('destino_diferente').subscribe((response): void => {
          const msg = response;
          reject(msg.descripcion);
        });
      });
    }

    return new Promise((resolve, reject) => {
      let modosTransportes = '';
      this.common.presentLoading();
      if (modoTransporte) {
        // debugger
        modosTransportes = modoTransporte;
      } else {
        modosTransportes = this.common.obtenerModosTransportesActivos(this.preferenciasTransportes);
      }

      const data =
        this.origen.lon +
        '/' +
        this.origen.lat +
        '/' +
        this.destino.lon +
        '/' +
        this.destino.lat +
        '/' +
        modosTransportes;

      this.wsMovilidad.obtenerPosiblesViajes(data).subscribe((success: any) => {
          // debugger
          this.common.dismissLoading();
          console.log('ObtenerPosiblesViajesViajesSugeridossuccess', success);
          if (success.codigo === 200 || success.codigo === 303) {
            const lat_origen = this.origen.lat;
            const lon_origen = this.origen.lon;
            const lat_destino = this.destino.lat;
            const lon_destino = this.destino.lon;
            const ori_desc = this.origen.descripcion;
            const des_desc = this.destino.descripcion;

            const mensaje = null;

            if (success.codigo === 303) {
              // mensaje = this.translateService.instant('app.viaje_no_encuentra_preferencias');
            }


            const response = {
              data: success,
              mensaje,
              lat_origen,
              lon_origen,
              lat_destino,
              lon_destino,
              ori_desc,
              des_desc
            };

            resolve(response);
          } else {
            const mensaje = '';
            if (success.codigo === 404) {
              // viaje_calculo_preferencia
              this.messageProvider.getByNombreIdentificador('viaje_calculo_preferencia').subscribe((response): void => {
                const msg = response;
                this.common.basicAlert(msg.titulo, msg.descripcion);
                this.common.dismissLoading();
              });
            }
            if (success.codigo === 409) {
              this.messageProvider.getByNombreIdentificador('inconveniente_movilidad').subscribe((response): void => {
                const msg = response;
                this.common.basicAlert(msg.titulo, msg.descripcion);
                this.common.dismissLoading();
              });
            }
          }
        },
        error => {
          this.messageProvider.getByNombreIdentificador('inconveniente_movilidad').subscribe((response): void => {
            const msg = response;
            this.common.basicAlert(msg.titulo, msg.descripcion);
            this.common.dismissLoading();
          });
        }
      );
    });
  }


  private obtenerModoTransporte(modoTransporteIn: any) {
    let modoTransporte = null;
    if (modoTransporteIn.id === 1 && modoTransporteIn.activo) {
      modoTransporte = '2';
    }

    if (modoTransporteIn.id === 2 && modoTransporteIn.activo) {
      modoTransporte = '0';
    }

    if (modoTransporteIn.id === 3 && modoTransporteIn.activo) {
      modoTransporte = '6';
    }

    if (modoTransporteIn.id === 4 && modoTransporteIn.activo) {
      modoTransporte = '3';
    }

    if (modoTransporteIn.id === 5 && modoTransporteIn.activo) {
      modoTransporte = '4,7';
    }

    if (modoTransporteIn.id === 6 && modoTransporteIn.activo) {
      modoTransporte = '1';
    }

    if (modoTransporteIn.id === 7 && modoTransporteIn.activo) {
      modoTransporte = '5';
    }

    if (modoTransporteIn.id === 8 && modoTransporteIn.activo) {
      modoTransporte = '8';
    }

    if (modoTransporteIn.id === 9 && modoTransporteIn.activo) {
      modoTransporte = '7';
    }

    return modoTransporte;
  }

}
