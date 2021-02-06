import { Country } from './../entities/country';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Municipality } from '../entities/municipality';
import { CONFIG_ENV } from '../shared/config-env-service/const-env';

@Injectable({
  providedIn: 'root'
})
export class TerritorioService {

  constructor(private http: HttpClient) { }

  getCountries(): Observable<Country[]> {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/paises';
    return this.http
        .get(url).pipe(
        map((response: any): Country[] => {
            console.log(TerritorioService.name + ' getCountries ' + JSON.stringify(response));
            return Country.parse(response);
        }));
  }

  getAmvaMunicipalities() {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/seguridad/municipios-AMVA';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return new Promise( resolve => {
        this.http
        .get(url, { headers })
        .subscribe(response => {
            console.log(TerritorioService.name + ' getAmvaMunicipalities ' + JSON.stringify(response));

            const municipalities: Municipality[] = Municipality.parse(Object.values(response));
            const medellinIndex: number =
                      municipalities.findIndex((municipality: Municipality): boolean => {
                                    return municipality.name === 'MEDELLIN'; });
            const medellin: Municipality = municipalities.splice(medellinIndex, 1)[0];
            municipalities.sort((m1: Municipality, m2: Municipality): number => {
                                    return m1.name.localeCompare(m2.name) ; })
                          .unshift(medellin);
            resolve(municipalities);
        });
      });
  }

  getInsideAmva(lat: number, lng: number) {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/contenedora/marker/inside'
    + '?lat=' + lat
    + '&lng=' + lng;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http.get(url, { headers });
  }

  getFullCharacterizationCard(lat: number, lng: number) {
    const url = CONFIG_ENV.REST_BASE_URL + '/api/contenedora/markers/character-tab'
            + '?lat=' + lat
            + '&lng=' + lng;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('bearer')
    };
    return this.http.get(url, { headers });
  }

}
