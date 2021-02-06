import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { MockService } from './../shared/mock/mock.service';
import { LayerService } from './layer.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer/ngx';
import { AlertController } from '@ionic/angular';
import { Common } from '../shared/utilidades/common.service';
import { UserHistory } from '../entities/userHistory';
import { CONFIG_ENV } from '../shared/config-env-service/const-env';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MidemeService {

  private fileTransferObject: FileTransferObject;

  constructor(private http: HttpClient,
              private fileTransfer: FileTransfer,
              private layerProvider: LayerService,
              private socialSharing: SocialSharing,
              private alertCtrl: AlertController,
              private common: Common,
              private servicesMock: MockService) {

              }

  getHistoryFromService(): Observable<UserHistory[]> {
    const username: any = localStorage.getItem('username');
    let url: string;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };

    url = CONFIG_ENV.REST_BASE_URL + '/api/formularioUsuario'
        + '?username=' + username;
    return this.http
    .get(url, { headers }).pipe(
      map((response: UserHistory[]) => {
          console.log(response);
          return UserHistory.parse(response);
      }));
  }

  getFormularioId() {
    let url: string;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    url = CONFIG_ENV.REST_BASE_URL + '/api/formulario/filter?idTipoFormulario=1';
    return this.http.get(url, { headers });
  }

  postCalculator(consumoDto) {
    let url: string;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    // url = 'http://172.16.0.84:9095' + '/api/huellas/evaluateConsumo';

    url = CONFIG_ENV.REST_BASE_URL + '/api/huellas/evaluateConsumo';
    return this.http
        .post(url, consumoDto, { headers });
  }

  getChallenges(): Observable<any> {
    let url: string;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };

    url = CONFIG_ENV.REST_BASE_URL + '/api/huellas/tiposReto/model';

    return this.http
        .get(url, { headers })
        .pipe(map((response: any) => {
            return response;
        }));
  }

  getChallengeUser() {
    let url: string;
    const username = localStorage.getItem('username');

    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };

    url = CONFIG_ENV.REST_BASE_URL + '/api/huellas/retoUsuario'
        + '?username=' + username;

    return this.http
        .get(url, { headers })
        .pipe(map((response: any) => {
            return response;
        }));
  }

  postSelectChallenge(challenge): Observable<any> {
    let url: string;
    const username = localStorage.getItem('username');

    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };

    url = CONFIG_ENV.REST_BASE_URL + '/api/huellas/retoUsuario'
        + '?idReto=' + challenge.id
        + '&username=' + username
        + '&diasEnCurso=0'
        + '&diasCumplidos=0'
        + '&estado=' + true
        + '&textoReto=' + challenge.nombre;

    return this.http
        .post(url, null, { headers });
  }

  updateCurrentChallenge(challenge): Observable<any> {
    console.log('This is the challente to cancel ,', JSON.stringify(challenge));
    const username: any = localStorage.getItem('username');
    let url: string;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };

    url = CONFIG_ENV.REST_BASE_URL + '/api//huellas/retoUsuario'
        + '?id=' + challenge.id
        + '&idReto=' + challenge.retoId
        + '&username=' + username
        + '&diasEnCurso=' + challenge.diaEnCurso
        + '&diasCumplidos=' + challenge.diasCumplidos
        + '&estado=' + challenge.estado
        + '&textoReto=' + challenge.retoTexto;

    return this.http.put(url, {}, { headers });
}

}
