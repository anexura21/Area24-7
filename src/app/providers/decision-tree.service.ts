import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { CONFIG_ENV } from '../shared/config-env-service/const-env';

@Injectable({
  providedIn: 'root'
})
export class DecisionTreeService {

  public replayArbol: ReplaySubject<any>;

  constructor(private http: HttpClient) { }

  getTree(idCapa) {
    const url = CONFIG_ENV.REST_BASE_URL + `/api/arbol/capa/${idCapa}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http.get(url, { headers });
  }

  getRoot(idArbol: number) {
    const url = CONFIG_ENV.REST_BASE_URL + `/api/nodo-arbol/raiz/arbol/${idArbol}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http.get(url, { headers });
  }

  getChildren(parentId: number) {
    const url = CONFIG_ENV.REST_BASE_URL + `/api/nodo-arbol/padre/${parentId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http.get(url, { headers });
}

}
