import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CONFIG_ENV } from '../shared/config-env-service/const-env';

@Injectable({
  providedIn: 'root'
})
export class EncuestaService {

  constructor(private http: HttpClient) { }

  getEncuesta() {
    let url: string;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    url = CONFIG_ENV.REST_BASE_URL + '/api/formulario';
    return this.http
      .get(url, { headers });
  }

  completeEncuesta(idEncuesta: number) {
    // Cerrar o cancelar una encuesta
    let username = localStorage.getItem('username');
    username = encodeURIComponent(username);
    let url: string;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    url = CONFIG_ENV.REST_BASE_URL + '/api/formulario-usuario-completado'
      + '?username=' + username
      + '&idFormulario=' + idEncuesta;
    return this.http.post(url, null, { headers });
  }

  sendOption(idPregunta: number, idOpcRespuesta: number) {
    // Enviar la opcion seleccionada de una pregunta
    let username = localStorage.getItem('username');
    username = encodeURIComponent(username);
    let url: string;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    url = CONFIG_ENV.REST_BASE_URL + '/api/formulario/respuesta'
      + '?username=' + username
      + '&idPregunta=' + idPregunta
      + '&idOpcRespuesta=' + idOpcRespuesta;
    return this.http.post(url, null, { headers });
  }

  sendResponse(idPregunta: any, respuesta: any) {
    let username = localStorage.getItem('username');
    username = encodeURIComponent(username);
    let url: string;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    url = CONFIG_ENV.REST_BASE_URL + '/api/formulario/respuesta'
      + '?username=' + username
      + '&idPregunta=' + idPregunta
      + '&otraRespuesta=' + respuesta;
    console.log('La URL de envio de respuesra', url);
    return this.http.post(url, null, { headers });
  }

}
