import { PosconsumoDetail } from './../entities/posconsumoDetail';
import { map } from 'rxjs/operators';
import { CONFIG_ENV } from './../shared/config-env-service/const-env';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PosconsumoMidemeService {

  constructor(private http: HttpClient) { }

  getDetail(marcadorId: number) {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/huellas/posconsumo/detail?idMarcador=' + marcadorId;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http
        .get(url, { headers })
        .pipe(map((response): PosconsumoDetail => {
            return PosconsumoDetail.parce(response);
        }));
  }

}
