import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { DisponibilidadEnciclaRequest } from '../../entities/movilidad/disponibilidad-encicla-request.model';
import { RutasCercanasRequest } from '../../entities/movilidad/rutas-cercanas-request.model';
import { UbicacionFavorita } from '../../entities/movilidad/ubicacion-favorita.model';
import { CONFIG_ENV } from '../../shared/config-env-service/const-env';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class WsMovilidadService {
  private urlApi: string;
  private options: {};
  public ubicacionesFavoritas: UbicacionFavorita[];
  public ubicacion: BehaviorSubject<UbicacionFavorita[]> = new BehaviorSubject([]);

  constructor(private http: HttpClient) {
    const envQuipux = false;
    if (envQuipux) {
      this.setEnvironment(1);
      CONFIG_ENV.REST_BASE_URL = this.urlApi;
    }
  }

  getUbicacionesFavoritas(){
    return this.ubicacion.asObservable();
  }


  setUbicacionesFavoritas(ubicacionesFavoritas: UbicacionFavorita[]){
    this.ubicacion.next(ubicacionesFavoritas);
  }

  obtenerRutasCercanas(data: RutasCercanasRequest) {
    this.resetRequestOptions( 'application/json' );
    return this.http.get(CONFIG_ENV.REST_BASE_URL +
      '/rutas/viajes/' +
      data.fecha +
      '/' +
      data.latitudOrigen +
      '/' +
      data.longitudOrigen +
      '/' +
      data.radio +
      '/' +
      data.modosTransporte, { headers: this.options });
  }

  obtenerDisponibilidadEncicla(data: DisponibilidadEnciclaRequest) {
    this.resetRequestOptions( 'application/json' );
    return this.http
      .get(
        CONFIG_ENV.REST_BASE_URL +
          '/rutas/encicla/disponibilidad/' +
          data.idEstacion,
          { headers: this.options }
      );
  }

  obtenerDisponibilidadEnciclaPromise(data: DisponibilidadEnciclaRequest){
    this.resetRequestOptions( 'application/json' );
    return new Promise((resolve, reject) => {
      this
        .http
          .get(CONFIG_ENV.REST_BASE_URL + '/rutas/encicla/disponibilidad/' + data.idEstacion, { headers: this.options })
            .subscribe((result: any) => {
              resolve(result);
            }, error => {
              reject(error);
            });
    });
  }

  public obtenerRutasyLineas(data: any) {
    this.resetRequestOptions( 'application/json' );
    return this.http
      .get(CONFIG_ENV.REST_BASE_URL + '/rutas/lineas/' + data, { headers: this.options });
  }

  public obtenerRutaLineaDetalle(tipo: any, id: any) {
    this.resetRequestOptions( 'application/json;charset=UTF-8' );
    return this.http
      .get(
        CONFIG_ENV.REST_BASE_URL + '/rutas/lineas/' + id + '/' + tipo,
        { headers: this.options }
      );
  }

  public obtenerRutasyLineasAutocompletado(data: any) {
    this.resetRequestOptions( 'application/json' );
    return this.http
      .get(
        CONFIG_ENV.REST_BASE_URL + '/rutas/autocompletado/' + data,
        { headers: this.options }
      );
  }

  public crearUbicacionFavorita(data: UbicacionFavorita) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('nombre', data.nombre);
    urlSearchParams.append('descripcion', data.descripcion);
    urlSearchParams.append('latitud', data.coordenada[1]);
    urlSearchParams.append('longitud', data.coordenada[0]);
    urlSearchParams.append('idUsuario', '' + data.idUsuario);
    urlSearchParams.append('idCategoria', '' + data.idCategoria);
    const body = urlSearchParams.toString();
    this.resetRequestOptions('application/x-www-form-urlencoded');

    return this.http
      .post(CONFIG_ENV.REST_BASE_URL + '/ubicaciones/add', body, { headers: this.options });
  }

  public updateListUbicaciones(id){
    this.obtenerUbicacionesFavoritas(id).toPromise()
      .then((data: UbicacionFavorita[]) => {
        this.setUbicacionesFavoritas(data);
      })
      .catch(err => console.log(err));
  }

  public obtenerUbicacionesFavoritas(data: any) {
    this.resetRequestOptions('application/json');
    return this.http
      .get(CONFIG_ENV.REST_BASE_URL + '/ubicaciones/' + data, { headers: this.options });
  }

  public eliminarUbicacionFavorita(data: any) {
    this.resetRequestOptions('application/json');

    return this.http
      .delete(
        CONFIG_ENV.REST_BASE_URL + '/ubicaciones/delete/' + data,
        { headers: this.options }
      );
  }

  public actualizarUbicacionFavorita(data: any) {
    this.resetRequestOptions('application/x-www-form-urlencoded');

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('id', data.id);
    urlSearchParams.append('nombre', data.nombre);
    urlSearchParams.append('descripcion', data.descripcion);
    urlSearchParams.append('latitud', data.coordenada[1]);
    urlSearchParams.append('longitud', data.coordenada[0]);
    urlSearchParams.append('idUsuario', '' + data.idUsuario);
    urlSearchParams.append('idCategoria', '' + data.idCategoria);
    const body = urlSearchParams.toString();

    return this.http
        .put(CONFIG_ENV.REST_BASE_URL + '/ubicaciones/update', body, { headers: this.options });
  }

  obtenerPosiblesViajes(data) {
    this.resetRequestOptions('application/json;charset=UTF-8');
    return this.http
      .get(CONFIG_ENV.REST_BASE_URL + '/viajes/' + data, { headers: this.options });
  }

  obtenerPronosticoSiata(data) {
    console.log('obtenerPronostico', data);
    // debugger;
    this.resetRequestOptions('application/json;charset=UTF-8');
    return this.http
      .get(CONFIG_ENV.REST_BASE_URL + '/pronostico/' + data, { headers: this.options });
  }

  public obtenerHuellaCarbno(data: any) {
    this.resetRequestOptions('application/json');
    return this.http
      .post(
        CONFIG_ENV.REST_BASE_URL + '/api/huellas/carbono/emision',
        data,
        { headers: this.options }
      );
  }

  obtenerHuellaCarbonoPronostico(dataHuella, dataPronositco){
    const obsList = [this.obtenerHuellaCarbno(dataHuella), this.obtenerPronosticoSiata(dataPronositco)];
    return forkJoin(obsList);
  }

  // consumir servicios relacionados a la funcionalidad de ciclo parqueaderos de puntos cercanos
  obtenerPuntosCicloParqueaderos(){
    const obsList = [
      this.obtenerPuntosEspacioPublico(),
      this.obtenerEstacionesSITVA(),
      this.obtenerEspaciosDeportivos(),
      this.obtenerEquipamientos(),
      this.obtenerParques()
    ];
    return forkJoin(obsList);
  }

  // servicio para consultar estaciones de encicla y ciclo rutas
  obtenerInformacionEncicla(){
    this.resetRequestOptions('application/json');
    return this.http
      .get(
        // "http://104.42.236.218/ApiEstacionesEncicla/estaciones",
        CONFIG_ENV.REST_BASE_URL + '/rutas/encicla/',
        { headers: this.options }
      );
      // .pipe( map (res => res['obj'].test));
  }

  obtenerPuntosEspacioPublico(){
    this.resetRequestOptions('application/json;charset=UTF-8');
    return this.http
      .get(CONFIG_ENV.REST_BASE_URL + '/api/contenedora/markers/CATEGORIA/861', { headers: this.options });
  }

  obtenerEstacionesSITVA(){
    this.resetRequestOptions('application/json;charset=UTF-8');
    return this.http
      .get(CONFIG_ENV.REST_BASE_URL + '/api/contenedora/markers/CATEGORIA/863', { headers: this.options });
  }

  obtenerEspaciosDeportivos(){
    this.resetRequestOptions('application/json;charset=UTF-8');
    return this.http
      .get(CONFIG_ENV.REST_BASE_URL + '/api/contenedora/markers/CATEGORIA/864', { headers: this.options });
  }

  obtenerEquipamientos(){
    this.resetRequestOptions('application/json;charset=UTF-8');
    return this.http
      .get(CONFIG_ENV.REST_BASE_URL + '/api/contenedora/markers/CATEGORIA/881', { headers: this.options });
  }

  obtenerParques(){
    this.resetRequestOptions('application/json;charset=UTF-8');
    return this.http
      .get(CONFIG_ENV.REST_BASE_URL + '/api/contenedora/markers/CATEGORIA/882', { headers: this.options });
  }

  obtenerCategoriasUbcacionFavorita() {
    const body = {};
    this.resetRequestOptions('application/json');
    return this.http.post(
      CONFIG_ENV.REST_BASE_URL + '/ubicaciones/categorias',
      body,
      { headers: this.options }
    );
  }

  removerUbicacionFavorita(idUbicacionFavorita: number) {
    const ubicaciones = this.ubicacionesFavoritas;
    ubicaciones.forEach((item, index) => {
      if (item.id === idUbicacionFavorita){
        ubicaciones.splice(index, 1);
      }
      this.setUbicacionesFavoritas(ubicaciones);
    });
  }

  // fin consumir servicios relacionados a la funcionalidad de ciclo parqueaderos de puntos cercanos

  private resetRequestOptions( contentType: string ){
    this.options = {
      'Content-Type': contentType,
      Authorization: localStorage.getItem('bearer')
    };
  }

  private setEnvironment(env: number) {
    switch (env) {
      case 1: // Ambiente desarrollo publico
        this.urlApi = 'http://apptest.quipux.com/amva';
        console.log('Enviroment desarrollo');
        break;

      case 2: // Ambiente desarrollo local
        // this.urlApi = 'http://10.125.30.27:9090';
        this.urlApi = '/api';
        console.log('Enviroment desarrollo');
        break;

      case 3: // Ambiente local
        this.urlApi = 'http://localhost:9090';
        console.log('Enviroment local');
        break;

      case 4: // Ambiente desarrollo ada
        this.urlApi =   'http://201.184.243.195:9095';
        console.log('Enviroment desarrollo ada');
        break;
    }
  }

}
