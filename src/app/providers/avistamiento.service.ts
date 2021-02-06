import { Comment } from './../entities/comment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CONFIG_ENV } from '../shared/config-env-service/const-env';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvistamientoService {

  constructor(private http: HttpClient) { }

  getAvistamientoComments(avistamientoId: number): Observable<Comment[]> {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/avistamiento/comentario/avistamiento/'
        + avistamientoId + '?nickname=' + localStorage.getItem('username');
    const headers = {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('bearer')
        };
    return this.http
        .get(url, { headers })
        .pipe(map(response => {
          console.log(response);
          console.log(AvistamientoService.name + ' getComments ' + JSON.stringify(response));
          return Comment.parse(JSON.parse(JSON.stringify(response)));
        }));
  }

  getStoryComments(storyId: number): Observable<Comment[]> {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/avistamiento/historia/comentario/historia/'
        + storyId + '?nickname=' + localStorage.getItem('username');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http
        .get(url, { headers })
        .pipe(map(response => {
            console.log(AvistamientoService.name + ' getComments ' + JSON.stringify(response));
            return Comment.parse(JSON.parse(JSON.stringify(response)));
        }));
  }


}
