import { map } from 'rxjs/operators';
import { LayerService } from './layer.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AlertController } from '@ionic/angular';
import { Common } from '../shared/utilidades/common.service';
import { CONFIG_ENV } from '../shared/config-env-service/const-env';

@Injectable({
  providedIn: 'root'
})
export class VigiaService {

  private fileTransferObject: FileTransferObject;

  constructor(private http: HttpClient,
              private fileTransfer: FileTransfer,
              private layerProvider: LayerService,
              private socialSharing: SocialSharing,
              private alertCtrl: AlertController,
              private common: Common) {
                this.fileTransferObject = this.fileTransfer.create();
              }

  getAvistamientoLayers() {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/categoria/findByTipoCapa?idTipoCapa=8';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http.get(url, { headers })
                .pipe(
                      map((response: any) => {
                        console.log(response);
                        console.log(VigiaService.name + ' getAvistamientoLayers ' + JSON.stringify(response), response);
                        const responseArray = response;
                        const avistamientoLayers: { id: number, name: string }[]
                            = responseArray;
                        return avistamientoLayers;
                      })
                );
  }

  getVigia(markerId: number, tipo: string) {
    let url: string;
    console.log('tipo:' + tipo);
    if (tipo === 'marker') {
        url = CONFIG_ENV.REST_BASE_URL + '/api/vigia/obtenerPorIdVigiaOIdMarcador'
            + '?idMarcador=' + markerId;
    }
    else {
        if (tipo === 'select') {
            url = CONFIG_ENV.REST_BASE_URL + '/api/vigia/obtenerPorIdVigiaOIdMarcador'
                + '?idVigia=' + markerId;
        }
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http.get(url, { headers });
  }

  getAutoridades() {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/autoridad';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http.get(url, { headers });
  }

  getVigiaComments(vigiaId: number) {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/vigia/comentarioVigia/'
    + vigiaId;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http.get(url, { headers });
  }

  getUrl() {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/vigia/url-PQRSD';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http.get(url, { headers });
  }

  getReports(coordenadas: any, idCapa: number) {
    let url: string;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };

    url = CONFIG_ENV.REST_BASE_URL + `/api/vigia/findByRadioYCapa/CAPA/${idCapa}`

        + '?latitud=' + coordenadas.lat
        + '&longitud=' + coordenadas.lng
        + '&radioAccion=500';

    return this.http
        .get(url, { headers });
}

}
