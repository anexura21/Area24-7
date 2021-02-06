import { CONFIG_ENV } from './../shared/config-env-service/const-env';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '../entities/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private http: HttpClient) { }

  get(id: string) {
    console.log(MessageService.name + ' get ');
    const url = CONFIG_ENV.REST_BASE_URL + '/api/mensaje/' + id;
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.get(url, { headers });
}

  getByNombreIdentificador(nombreIdentificador: string) {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/mensaje/nombreIdentificador/' + nombreIdentificador;
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.get<Message>(url, { headers });
  }
}
