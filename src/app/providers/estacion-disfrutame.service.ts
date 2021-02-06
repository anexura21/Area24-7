import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CONFIG_ENV } from '../shared/config-env-service/const-env';

@Injectable({
  providedIn: 'root'
})
export class EstacionDisfrutameService {

  constructor(private http: HttpClient) { }

  getDetail(marcadorId: number) {
    const url = CONFIG_ENV.REST_BASE_URL +
          '/api/entorno/estacion/detalle/find-By-Marker?idMarcador=' +
          marcadorId;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    console.log(localStorage.getItem('bearer'));

    return this.http.get(url, { headers });
  }

  getClima(marcadorId: number) {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/entorno/clima/detalle/find-By-Marker?idMarcador=' + marcadorId;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http.get(url, { headers });
}

}
