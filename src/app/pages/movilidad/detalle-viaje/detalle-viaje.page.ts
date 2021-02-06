import { Ubicacion } from './../../../entities/movilidad/ubicacion.model';
import { UtilsMovilidadService } from './../../../providers/movilidad/utils-movilidad.service';
import { HuellaEmisionRequest } from './../../../entities/movilidad/huella-emision-request';
import { OtherLayer } from './../../../entities/other-layer';
import { ActivatedRoute } from '@angular/router';
import { TransportMode } from './../../../entities/transport-mode';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { LocationChangeService } from './../../../providers/location-change.service';
import { LocationUpdateService } from './../../../providers/location-update.service';
import { MessageService } from './../../../providers/message.service';
import { LayerService } from './../../../providers/layer.service';
import { DatePipe } from '@angular/common';
import { WsMovilidadService } from './../../../providers/movilidad/ws-movilidad.service';
import { Common } from './../../../shared/utilidades/common.service';
import { GmapsMovilidadService } from './../../../providers/movilidad/gmaps-movilidad.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { filter, timeout } from 'rxjs/operators';

@Component({
  selector: 'detalle-viaje',
  templateUrl: './detalle-viaje.page.html',
})
export class DetalleViajePage implements OnInit, OnDestroy {

  @Output() clickVerEnMapa?: EventEmitter<any> = new EventEmitter();
  showDetalle: boolean;
  gmapsMovildiad = GmapsMovilidadService;
  myMarker;

  emisionCO2: number;
  emisionPM2_5: number;
  emisionCO2Autos: number;
  emisionCO2Evitada: number;
  kilometrajeAuto: number;
  tarifaTotalViaje: number;
  public app: any = this;
  titulo: string;

  private DISTANCE_TOLERANCE = 0;
  private LOCATION_UPDATES_INTERVAL = 5000;
  private locationUpdateSubscription: Subscription;

  public flag_show_sidemenu;
  public root: any;

  origen = {
      latitud: 0,
      longitud: 0,
      descripcion: ''
  };

  destino = {
      latitud: 0,
      longitud: 0,
      descripcion: ''
  };

  pronostico = {
      codigo: 0,
      descTiempoOrigen: '',
      idProbabilidadOrigen: 0,
      descProbabilidadOrigen: '',
      descTiempoDestino: '',
      idProbabilidadDestino: 0,
      descProbabilidadDestino: '',
      descripcion: '',
      urlIconoTiempoOrigen: '',
      urlIconoTiempoDestino: '',
      urlIconoProbabilidadOrigen: '',
      urlIconoProbabilidadDestino: ''
  };

  currentDate = new Date();

  viaje = {
      duracion: '',
      distancia: 0,
      pasos: [],
      flightPlans: []
  };

  itinerarios: any;

  adressorigin1 = '';
  adressorigin2 = '';
  adressdestino1 = '';
  adressdestino2 = '';

  pasoAnterior: any;
  sidebarEvent: any;
  preferenciasTransportes: any;

  private isEnciclaViaje: boolean;
  private pronosticoSubscription: Subscription;
  private huellaSubscription: Subscription;

  tiempoDuracion = '';

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 3
  };

  constructor( public gMaps: GmapsMovilidadService,
               private common: Common,
               public wsMovilidad: WsMovilidadService,
               private datePipe: DatePipe,
               private layerProvider: LayerService,
               private messageProvider: MessageService,
               private locationUpdate: LocationUpdateService,
               private locationChange: LocationChangeService,
               private geoLocation: Geolocation,
               private domSanitizer: DomSanitizer,
               private route: ActivatedRoute ) {
                this.isEnciclaViaje = false;
                this.sidebarEvent = this.layerProvider.transportModesChange$.subscribe(
                    (transportsPreferences: TransportMode[]) => {
                        this.preferenciasTransportes = transportsPreferences;
                    }
                );

                this.showDetalle = false;
                this.route.params.subscribe(( data ) => {

                  this.tiempoDuracion = data['tiempoDuracion'];
                  const dataV = data['viaje'];

                  const origen1 = data['origen'];
                  const destino1 = data['destino'];
                  this.kilometrajeAuto = data['kilometrajeAuto'];
                  this.tarifaTotalViaje = data['tarifaTotalViaje'];
                  this.flag_show_sidemenu = data['flag_show_sidemenu'];
                  this.itinerarios = data['itinerarios'];
                  this.root = data['root'];
                  this.origen.latitud = origen1.latitud;
                  this.origen.longitud = origen1.longitud;
                  this.origen.descripcion = origen1.descripcion;

                  this.destino.latitud = destino1.latitud;
                  this.destino.longitud = destino1.longitud;
                  this.destino.descripcion = destino1.descripcion;

                  this.viaje.distancia = Number(this.parseDistance(data.pasos));
                  this.viaje.duracion = dataV.duracion;
                  this.viaje.pasos = dataV.pasos;
                });

                this.ajustarDireccion();
                GmapsMovilidadService.markersPolylinesViajes = [];

                for (const paso of this.viaje.pasos) {
                    let modo = '';

                    switch (paso.mode) {
                        case 'TRAM':
                            modo = 'tranvia';
                            break;

                        case 'RAIL':
                            modo = 'metro';
                            break;
                        case 'WALK':
                            modo = 'caminar';
                            break;
                        case 'BICYCLE':
                            modo = 'bici-particular';
                            break;
                        case 'CABLE_CAR':
                            modo = 'cicloruta';
                            break;
                        case 'SUBWAY':
                            modo = 'bus';
                            break;
                        case 'GONDOLA':
                            modo = 'metrocable';
                            break;
                        case 'FUNICULAR':
                            modo = 'bus-integrado';
                            break;
                        case 'FERRY':
                            modo = 'bus-alimentador';
                            break;
                        case 'BUS':
                            modo = 'metroplus';
                            break;
                    }
                    const flightPlanCoordinates = [];
                    if (paso.mode === 'WALK') {
                        if (this.pasoAnterior) {
                            flightPlanCoordinates.push({
                                lat: this.pasoAnterior.to.lat,
                                lng: this.pasoAnterior.to.lon
                            });
                        } else {
                            flightPlanCoordinates.push({
                                lat: paso.from.lat,
                                lng: paso.from.lon
                            });
                        }
                        for (const step of paso.steps) {
                            const lat = step.lat;
                            const lon = step.lon;
                            flightPlanCoordinates.push({ lat, lng: lon });
                        }
                        flightPlanCoordinates.push({
                            lat: paso.to.lat,
                            lng: paso.to.lon
                        });
                    } else {
                        if (paso.coordenadas != null) {
                            console.log('Paso: ' + paso.mode, paso.coordenadas);
                            if (this.pasoAnterior) {
                                flightPlanCoordinates.push({
                                    lat: this.pasoAnterior.to.lat,
                                    lng: this.pasoAnterior.to.lon
                                });
                            } else {
                                flightPlanCoordinates.push({
                                    lat: paso.from.lat,
                                    lng: paso.from.lon
                                });
                            }
                            let contador = 0;
                            for (const coord of paso.coordenadas) {
                                const lat = coord.x;
                                const lon = coord.y;
                                if (
                                    contador === 0 ||
                                    contador === paso.coordenadas.length - 1
                                ) {
                                    console.log(
                                        'DetalleViaje',
                                        'Eliminando coordenadas erroneas ' + contador
                                    );
                                } else {
                                    flightPlanCoordinates.push({ lat, lng: lon });
                                }
                                contador++;
                            }
                            flightPlanCoordinates.push({
                                lat: paso.to.lat,
                                lng: paso.to.lon
                            });
                        }
                    }
                    const retorno = GmapsMovilidadService.renderPoint(
                        flightPlanCoordinates,
                        modo
                    );
                    GmapsMovilidadService.markersPolylinesViajes.push(retorno);
                    this.viaje.flightPlans.push(retorno);
                    this.pasoAnterior = paso;
                }
                this.pintarOrigenDestino();
                this.titulo = this.root.children.find(
                    (layer: OtherLayer) => layer.layerType === 'MAPA DE VIAJES'
                ).name;
               }

  private parseDistance(pasos) {
    let distance = 0;
    for (const paso of pasos) {
        if (paso.distance) {
            distance =
                distance + parseFloat(paso.distance.replace(',', '.'));
        }
    }

    return Number(distance).toFixed(2);
  }

  private pintarOrigenDestino() {
      const dataMarkerOrigen = {
          icono: 'assets/movilidad/markers/markerInicio.svg',
          mLat: this.origen.latitud,
          mLng: this.origen.longitud
      };
      const dataMarkerDestino = {
          icono: 'assets/movilidad/markers/markerLlegada.svg',
          mLat: this.destino.latitud,
          mLng: this.destino.longitud
      };
      GmapsMovilidadService.markersPolylinesViajes.push(
          GmapsMovilidadService.pintarMarker(dataMarkerOrigen)
      );
      GmapsMovilidadService.markersPolylinesViajes.push(
          GmapsMovilidadService.pintarMarker(dataMarkerDestino)
      );
      const bounds = new google.maps.LatLngBounds();
      const map = GmapsMovilidadService.getMapa();
      bounds.extend(
          new google.maps.LatLng(this.origen.latitud, this.origen.longitud)
      );
      bounds.extend(
          new google.maps.LatLng(this.destino.latitud, this.destino.longitud)
      );
      map.fitBounds(bounds);
  }
  ngOnInit() {
      this.turnOnLocationUpdate();
      this.buscarPronostico();
      const geoposition: Geoposition = this.locationChange.getGeoposition();
      const { latitude, longitude } = geoposition.coords;
      GmapsMovilidadService.centrarMapaDetailViaje(
          this.origen.latitud,
          this.origen.longitud,
          16
      );
      this.pintarMaker(latitude, longitude);
  }

  ngOnDestroy() {
      if (this.huellaSubscription) {this.huellaSubscription.unsubscribe(); }
      if (this.pronosticoSubscription)
          {this.pronosticoSubscription.unsubscribe(); }
      if (this.locationUpdateSubscription)
          {this.locationUpdateSubscription.unsubscribe(); }
      GmapsMovilidadService.deletePositionMarker();
  }

  goBack() {
    this.common.dismissModal();
}

pintarMaker(lat: number, lng: number) {
    if (lat && lng) {
        const pos: Ubicacion = new Ubicacion();
        pos.longitud = lng;
        pos.latitud = lat;
        this.myMarker = GmapsMovilidadService.createPositionMarker(pos);
    }
}

turnOnLocationUpdate() {
    if (this.locationUpdateSubscription) {return; }
    this.locationUpdateSubscription = this.geoLocation
        .watchPosition()
        .pipe(filter((p: Geoposition) => p.coords !== undefined))
        .subscribe(data => {
            this.pintarMaker(data.coords.latitude, data.coords.longitude);
        });
}

buscarPronostico() {
    this.common.presentLoading();
    const dataPronositco = this.obtenerDataPronostico();
    const dataHuella = this.obtenerDataHuellaCarbono();
    this.getPronosticos(dataHuella, dataPronositco);
}

// limpiar mapa
ionViewDidLeave() {
    GmapsMovilidadService.eliminarMarkersPolylines(
        GmapsMovilidadService.markersPolylinesViajes
    );
    const map = GmapsMovilidadService.getMapa();
    map.setZoom(11);
    if (this.myMarker) {
        this.myMarker.setMap(null);
    }

    this.common.dismissLoading();
}

clickMostrarDetalle() {
    if (this.pronostico.codigo === 0) {
        this.showDetalle = !this.showDetalle;
    } else {
        this.showDetalle = !this.showDetalle;
    }
    if (this.showDetalle) {
        document
            .getElementById('contenedorDetalle')
            .classList.add('fullCard');
    } else {
        document
            .getElementById('contenedorDetalle')
            .classList.remove('fullCard');
    }
}

obtenerDataHuellaCarbono() {
    let data: HuellaEmisionRequest[] = [];
    let item: HuellaEmisionRequest;

    for (const paso of this.viaje.pasos) {
        item = new HuellaEmisionRequest();
        const modoTrasnporte = UtilsMovilidadService.obtenerModoTransporteHuella(
            paso.mode
        );
        item.tipoTransporte = modoTrasnporte;
        item.kilometraje = parseFloat(paso.distance.replace(',', '.'));
        data = this.cargarHuellaEmisionRequest(item, data);
    }
    return data;
}

cargarHuellaEmisionRequest(
    item: HuellaEmisionRequest,
    array: HuellaEmisionRequest[]
): HuellaEmisionRequest[] {
    if (array.length === 0) {
        array.push(item);
    } else {
        for (const element of  array) {
          if (element.tipoTransporte === item.tipoTransporte) {
            element.kilometraje += item.kilometraje;
            break;
        } else {
            array.push(item);
            break;
        }
        }
    }

    return array;
}

// hacer wrap a las direcciones
ajustarDireccion() {
    const inicio = this.origen.descripcion.split(', ');
    this.adressorigin1 = inicio[0];

    for (let i = 0; i < inicio.length; i++) {
        if (i !== 0) {
            this.adressorigin2 += inicio[i];
            if (i !== inicio.length - 1) {
                this.adressorigin2 += ', ';
            }
        }
    }

    const fin = this.destino.descripcion.split(', ');
    this.adressdestino1 = fin[0];

    for (let i = 0; i < fin.length; i++) {
        if (i !== 0) {
            this.adressdestino2 += fin[i];
            if (i !== fin.length - 1) {
                this.adressdestino2 += ', ';
            }
        }
    }
}

obtenerDataPronostico() {
    const day: any = this.currentDate.getDate();
    const month: any = this.currentDate.getMonth() + 1;
    const year: any = this.currentDate.getFullYear();
    const hours: any = this.currentDate.getHours();
    const minutes: any = this.currentDate.getMinutes();
    const seconds: any = this.currentDate.getSeconds();

    const dateInApiFormat =
        year +
        '-' +
        month +
        '-' +
        day +
        ' ' +
        hours +
        ':' +
        minutes +
        ':' +
        seconds;

    const fechaActual = dateInApiFormat;

    const duracion = this.viaje.duracion.split(':');
    const h = duracion[0];
    const m = duracion[1];
    const s = duracion[2];

    let sh: number = Number.parseInt(hours, 0) + Number.parseInt(h, 0);
    let sm: number = Number.parseInt(minutes, 0) + Number.parseInt(m, 0);
    let ss: number = Number.parseInt(seconds, 0) + Number.parseInt(s, 0);

    if (ss > 59) {
        sm = sm + 1;
        ss = ss - 60;
    }

    if (sm > 59) {
        sh = sh + 1;
        sm = sm - 60;
    }

    const dateInApiFormat2 =
        year + '-' + month + '-' + day + ' ' + sh + ':' + sm + ':' + ss;
    const fechaDestino = dateInApiFormat2;

    const data =
        fechaActual +
        '/' +
        fechaActual +
        '/' +
        this.origen.longitud +
        '/' +
        this.origen.latitud +
        '/' +
        fechaDestino +
        '/' +
        this.destino.longitud +
        '/' +
        this.destino.latitud +
        '/';

    return data;
}

obtenerPronostico(data) {
    this.wsMovilidad.obtenerPronosticoSiata(data).subscribe(
        succes => {
            this.common.dismissLoading();
            console.log('ObtenerPronosticoSucces', succes);
            this.mapearPronostico(succes);
        },
        error => {
            this.messageProvider
                .getByNombreIdentificador('inconveniente_movilidad')
                .subscribe((response): void => {
                    const msg = response;
                    this.common.basicAlert(msg.titulo, msg.descripcion);
                });
        }
    );
}

ajustarDuracionParaTiempoTotal(duration) {
    const hours = Math.floor(duration / 3600);
    let minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    let mensaje = '';

    if (hours !== 0) {
        if (minutes !== 0) {
            if (seconds > 30) {
                minutes++;
                mensaje = hours + ' h ' + minutes + ' min.';
            } else {
                mensaje = hours + ' h ' + minutes + ' min.';
            }
        } else {
            mensaje = hours + ' h.';
        }
    } else {
        if (seconds > 30) {
            minutes++;
            mensaje = minutes + ' min.';
        } else {
            mensaje = minutes + ' min.';
        }
    }

    return mensaje;
}

mapearPronostico(responsePronostico) {
    this.pronostico.codigo = responsePronostico.codigo;
    this.pronostico.descTiempoOrigen = responsePronostico.descTiempoOrigen;
    this.pronostico.idProbabilidadOrigen =
        responsePronostico.idProbabilidadOrigen;
    this.pronostico.descProbabilidadOrigen =
        responsePronostico.descProbabilidadOrigen;
    this.pronostico.descTiempoDestino =
        responsePronostico.descTiempoDestino;
    this.pronostico.idProbabilidadDestino =
        responsePronostico.idProbabilidadDestino;
    this.pronostico.descProbabilidadDestino =
        responsePronostico.descProbabilidadDestino;
    this.pronostico.descripcion = responsePronostico.descripcion;
    this.pronostico.urlIconoTiempoOrigen =
        responsePronostico.urlIconoTiempoOrigen;
    this.pronostico.urlIconoTiempoDestino =
        responsePronostico.urlIconoTiempoDestino;
    this.pronostico.urlIconoProbabilidadOrigen =
        responsePronostico.urlIconoProbabilidadOrigen;
    this.pronostico.urlIconoProbabilidadDestino =
        responsePronostico.urlIconoProbabilidadDestino;
}

mapearHuellaCarbono(responseHuellaCarbono) {
    this.emisionCO2 = responseHuellaCarbono.responses[0].emisionCO2.toFixed(
        2
    );
    this.emisionPM2_5 = responseHuellaCarbono.responses[0].emisionPM2_5.toFixed(
        2
    );
    this.emisionCO2Autos =
        responseHuellaCarbono.responses[0].emisionCO2Autos;
    this.emisionCO2Evitada = Number(
        (this.emisionCO2Autos - this.emisionCO2).toFixed(2)
    );
}

public getPronosticos(dataHuella, dataPronositco) {
  const pronostico = this.wsMovilidad.obtenerHuellaCarbonoPronostico(
      dataHuella,
      dataPronositco
  );
  this.pronosticoSubscription = pronostico.pipe(timeout(10000)).subscribe(
      data => {
          console.log(data);
          this.mapearHuellaCarbono(data[0]);
          this.mapearPronostico(data[1]);
          this.common.dismissLoading();
      },
      err => {
          this.common.dismissLoading();
          this.messageProvider
              .getByNombreIdentificador('inconveniente_movilidad')
              .subscribe((response): void => {
                  const msg = response;
                  this.common.basicAlert(msg.titulo, msg.descripcion);
              });
      }
  );
}

onObtenerHuellaCarbonoPronostico(dataHuella, dataPronositco) {
  this.huellaSubscription = this.wsMovilidad
      .obtenerHuellaCarbonoPronostico(dataHuella, dataPronositco)
      .pipe(timeout(10000))
      .subscribe(
          data => {
              console.log('onObtenerHuellaCarbonoPronostico', data);
              this.mapearHuellaCarbono(data[0]);
              this.mapearPronostico(data[1]);
              this.common.dismissLoading();
          },
          err => {
              this.common.dismissLoading();
              this.common.basicAlert(
                  'Movilidad',
                  'Ocurrió un inconveniente inténtelo nuevamente'
              );
          }
      );
}

public getImgDetail(item: any, preferenciasTransportes: any): any {
    console.log(preferenciasTransportes);
    const modoTransporte = {
        color: '',
        imagen: ''
    };
    const { mode } = item;

    switch (mode) {
        case 'WALK': {
            modoTransporte.imagen =
                'https://area247.metropol.gov.co/api/icono/2179';
            modoTransporte.color = '#0060B6';
            break;
        }
        case 'CABLE_CAR': {
            // Ciclo ruta
            const preferencia = this.getTransportModeById(
                5,
                preferenciasTransportes
            );
            modoTransporte.imagen = preferencia[0].urlIconEnabled;
            modoTransporte.color = '#FF9C04';
            break;
        }

        case 'BICYCLE': {
            const { cantidadBicicletasDisponibles } = item.from;
            if (cantidadBicicletasDisponibles || this.isEnciclaViaje) {
                const preferencia = this.getTransportModeById(
                    5,
                    preferenciasTransportes
                );
                modoTransporte.imagen = preferencia[0].urlIconEnabled;
                modoTransporte.color = '#FF000F';
                this.isEnciclaViaje = true;
            } else {
                const preferencia = this.getTransportModeById(
                    8,
                    preferenciasTransportes
                );
                modoTransporte.imagen = preferencia[0].urlIconEnabled;
                modoTransporte.color = '#FF000F';
            }
            break;
        }
        case 'SUBWAY': {
            // BUSES GTPC
            const preferencia = this.getTransportModeById(
                1,
                preferenciasTransportes
            );
            modoTransporte.imagen = preferencia[0].urlIconEnabled;
            modoTransporte.color = '#1717D3';
            break;
        }
        case 'FUNICULAR': {
            // integrado
            const preferencia = this.getTransportModeById(
                4,
                preferenciasTransportes
            );
            modoTransporte.imagen = preferencia[0].urlIconEnabled;
            modoTransporte.color = '#3bbe98';
            break;
        }

        case 'FERRY': {
            // alimentador
            const preferencia = this.getTransportModeById(
                4,
                preferenciasTransportes
            );
            modoTransporte.imagen = preferencia[0].urlIconEnabled;
            modoTransporte.color = '#FFFB00';
            break;
        }
        case 'GONDOLA': {
            const preferencia = this.getTransportModeById(
                6,
                preferenciasTransportes
            );
            modoTransporte.imagen = preferencia[0].urlIconEnabled;
            modoTransporte.color = '#5d6a9c';
            break;
        }
        case 'TRAM': {
            const preferencia = this.getTransportModeById(
                0,
                preferenciasTransportes
            );
            modoTransporte.imagen = preferencia[0].urlIconEnabled;
            modoTransporte.color = '#5db8ff';
            break;
        }
        case 'BUS': {
            // Metro PLUS

            const preferencia = this.getTransportModeById(
                3,
                preferenciasTransportes
            );
            modoTransporte.imagen = preferencia[0].urlIconEnabled;
            modoTransporte.color = '#3b897f';
            break;
        }

        case 'RAIL': {
            const preferencia = this.getTransportModeById(
                2,
                preferenciasTransportes
            );
            modoTransporte.imagen = preferencia[0].urlIconEnabled;
            modoTransporte.color = '#00D20D';
            break;
        }
    } // end switch statement

    return modoTransporte;
  }

  private getTransportModeById(id: number, transportMode: any) {
      return transportMode.filter(elm => elm._id === id);
  }

}
