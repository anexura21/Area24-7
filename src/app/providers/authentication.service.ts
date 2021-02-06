import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../entities/user';
import { CONFIG_ENV } from '../shared/config-env-service/const-env';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

 constructor(private http: HttpClient) { }

  login(user: User) {
    console.log('AuthenticationService login ' + JSON.stringify(user.toJsonObject()));
    const url = encodeURI(CONFIG_ENV.REST_BASE_URL + '/api/login');
    const headers = {
      'Content-Type': 'application/json'
    };
    // headers.append('Content-Type', 'application/json;charset=UTF-8');
    // headers.append('Content-Type', 'application/json');
    // headers.append('Accept', '*/*');
    return this.http.post(url, JSON.stringify(user.toJsonObject()), { headers });
  }

  existUser(username: string) {
    username = encodeURIComponent(username);
    const url = CONFIG_ENV.REST_BASE_URL + '/api/existeUsuario?nickname=' + username;
    const headers = {'Content-Type': 'application/json' };
    return this.http.post(url, {}, { headers });
  }

  enroll(user: User) {
    console.log('AuthenticationProvider enroll ' + JSON.stringify(user.toJsonObject()));
    const url = CONFIG_ENV.REST_BASE_URL + '/api/registro';
    const headers = {'Content-Type': 'application/json'};
    return this.http.post(url, JSON.stringify(user.toJsonObject()), { headers });
  }

  restore(email: string) {
    console.log('AuthenticationProvider restore ' + email);
    const url = CONFIG_ENV.REST_BASE_URL + '/api/usuario-restablecer-pass'
            + '?username=' + email;
    const headers = {'Content-Type': 'application/json'};
    return this.http.put(url, {}, { headers });
  }

  get() {
    let username: string = localStorage.getItem('username');
    username = encodeURIComponent(username);

    console.log('AuthenticationProvider post ' + username);
    const url = CONFIG_ENV.REST_BASE_URL + '/api/usuario-por-username?username=' + username;
    const headers = {'Content-Type': 'application/json',
                   Authorization: localStorage.getItem('bearer')};
    return this.http.post(url, {}, { headers });
  }

  update(user: User) {
    console.log('AuthenticationProvider update ' + JSON.stringify(user.updateJsonObject()));
    const url = CONFIG_ENV.REST_BASE_URL + '/api/usuario';
    const headers = {'Content-Type': 'application/json',
                      Authorization: localStorage.getItem('bearer')};
    return this.http.put(url, JSON.stringify(user.updateJsonObject()), { headers });
  }

  updatePassword(username: string, currentPassword: string, newPassword: string) {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/usuario/actualizar-password';
    const headers = {'Content-Type': 'application/json',
                      Authorization: localStorage.getItem('bearer')};
    const params = {
          username
        , currentPassword
        ,  newPassword
    };
    return this.http.put(url, JSON.stringify(params), { headers });
  }

}
