import { DisponibilidadEnciclaRequest } from './../../../entities/movilidad/disponibilidad-encicla-request.model';
import { FavoritosService } from '../../../providers/movilidad/favoritos.service';
import { MessageService } from './../../../providers/message.service';
import { GooglemapsService } from './../../../providers/googlemaps.service';
import { EstablecerUbicacionPage } from './../establecer-ubicacion/establecer-ubicacion.page';
import { ModalController } from '@ionic/angular';
import { TransportMode } from './../../../entities/transport-mode';
import { OtherLayerComponent } from './../../../components/other-layer/other-layer.component';
import { GmapsMovilidadService } from './../../../providers/movilidad/gmaps-movilidad.service';
import { OtherLayer } from './../../../entities/other-layer';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationChangeService } from './../../../providers/location-change.service';
import { LocationUpdateService } from './../../../providers/location-update.service';
import { LayerService } from './../../../providers/layer.service';
import { PosiblesViajesService } from './../../../providers/posibles-viajes.service';
import { WsMovilidadService } from './../../../providers/movilidad/ws-movilidad.service';
import { Common } from './../../../shared/utilidades/common.service';
import { AppLayer } from './../../../entities/app-layer';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { MODOS_BUSQUEDA, Ubicacion } from './../../../entities/movilidad/ubicacion.model';
import { DecimalPipe } from '@angular/common';
import { DisponibilidadEnciclaResponse } from './../../../entities/movilidad/disponibilidad-encicla-response';

enum Modos {
  NUEVO,
  GUARDAR
}

@Component({
  selector: 'vista-viajes',
  templateUrl: './vista-viajes.page.html'
})
export class VistaViajesPage implements OnInit, OnDestroy {

  @Input() ubicacion: Ubicacion;
  ubicacionOrigen: Ubicacion;
  ubicacionDestino: Ubicacion;
  kilometrajeAuto: number;
  tarifaTotalViaje: number;
  gmapsMovildiad = GmapsMovilidadService;
  layerActive = 1;
  item: any = {
      nombre: '',
      ubicacion: {}
  };
  appSettings: any = {};
  modo: any = Modos.NUEVO;
  alternativaViaje = false;
  root: any;
  itineraries: any[];
  flagShowBestDistance = false;
  flagShowBestTime = false;
  seleccionarMapaModalFavorito = false;
  modalFavorito = true;
  sumaDistancia1 = 0;
  sumaDistancia2 = 0;
  titulo: string;
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
  loader: any;

  mejordistancia = {
      duracion: '',
      distancia: '',
      pasos: []
  };

  mejorTiempo = {
      duracion: '',
      distancia: '',
      pasos: []
  };
  response: any;
  msg_no_avalible_trip: string;

  isWaitingTimeUsed: boolean;
  isEnciclaUsed: boolean;
  sidebarEvent: any;
  contador1 = 0;
  contador2 = 0;
  preferenciasTransportes: any;
  public flag_show_sidemenu: boolean;

  @Output() clickGuardarUbicacionFavorita?: EventEmitter<any> = new EventEmitter();
  @Output() clickSeleccionarUbicacionMapaFavorita?: EventEmitter<any> = new EventEmitter();

  mejorTiempoDuracion = '';
  mejordistanciaDuracion = '';

  constructor(public favoritos: FavoritosService,
              public googleMaps: GooglemapsService,
              public wsMovilidad: WsMovilidadService,
              private common: Common,
              private pipe: DecimalPipe,
              private layerProvider: LayerService,
              private messageProvider: MessageService,
              private route: ActivatedRoute,
              private router: Router) {
                this.ubicacionDestino = new Ubicacion();
                this.ubicacionOrigen = new Ubicacion();
                this.isWaitingTimeUsed = false;
                let lat_origen;
                let lon_origen;
                let lat_destino;
                let lon_destino;
                let ori_desc;
                let des_desc;
                this.route.params.subscribe(( data ) => {
                    console.log(data);
                    lat_origen = data['lat_origen'];
                    lon_origen = data['lon_origen'];
                    lat_destino = data['lat_destino'];
                    lon_destino = data['lon_destino'];
                    ori_desc = data['ori_desc'];
                    des_desc =  data['des_desc'];
                    this.root = data['app'];
                    this.cargarDatos(
                        data,
                        data['mensaje']
                    );
                    this.flag_show_sidemenu = data['flag_show_sidemenu'];
                });
                this.cargarUbicacionInicioDestino(
                    lat_origen,
                    lon_origen,
                    ori_desc,
                    lat_destino,
                    lon_destino,
                    des_desc
                );

                this.gmapsMovildiad.centrarMapa(
                    this.ubicacionOrigen.latitud,
                    this.ubicacionOrigen.longitud
                );
                this.appSettings.color = 'blue';

                this.titulo = this.root.children.find(
                    (layer: OtherLayer) => layer.layerType === 'MAPA DE VIAJES'
                ).name;

                const mensaje_no_encuetra = 'viaje_no_encuentra_preferencias';
                this.messageProvider
                    .getByNombreIdentificador(mensaje_no_encuetra)
                    .toPromise()
                    .then(res => {
                        const msg = res;
                        this.msg_no_avalible_trip = msg.descripcion;
                    });
  }

  ngOnInit() {
    this.sidebarEvent = this.layerProvider.transportModesChange$.subscribe(
        (transportsPreferences: TransportMode[]) => {
            this.preferenciasTransportes = transportsPreferences;
        }
    );
  }

  ngOnDestroy() {
      this.sidebarEvent.unsubscribe();
  }

  ionViewDidLeave() {
    this.common.dismissLoading();
    }

    private cargarUbicacionInicioDestino(
        lat_origen: any,
        lon_origen: any,
        ori_desc: any,
        lat_destino: any,
        lon_destino: any,
        des_desc: any
    ) {
        this.origen.latitud = lat_origen;
        this.origen.longitud = lon_origen;
        this.origen.descripcion = ori_desc;
        this.ubicacionOrigen.latitud = lat_origen;
        this.ubicacionOrigen.longitud = lon_origen;
        this.ubicacionOrigen.descripcion = ori_desc;
        this.destino.latitud = lat_destino;
        this.destino.longitud = lon_destino;
        this.destino.descripcion = des_desc;
        this.ubicacionDestino.latitud = lat_destino;
        this.ubicacionDestino.longitud = lon_destino;
        this.ubicacionDestino.descripcion = des_desc;
    }

    cargarDatos(response, mensaje) {
        this.response = response;
        if (
            response.mensaje == null ||
            response.mensaje !== 'Consulta exitosa'
        ) {
            this.alternativaViaje = true;
        }
        this.itineraries = response.plan.itineraries;
        this.tarifaTotalViaje = response.plan.itineraries[0].rate;
        this.kilometrajeAuto = response.plan.distanceByCar;
        this.llenarPasos();
        this.common.presentLoading();
        this.convertirtiempo();
        this.common.dismissLoading();
    }

    async llenarPasos() {
        this.sumaDistancia1 = 0;
        this.sumaDistancia2 = 0;
        this.contador1 = 0;
        this.contador2 = 0;

        this.mejorTiempo.pasos = [];
        this.mejordistancia.pasos = [];

        if (this.itineraries.length === 2) {
            this.flagShowBestDistance = true;
            this.flagShowBestTime = true;
            for (const paso of this.itineraries[1].legs) {
                let mode = paso.mode;
                const tipoTransporte = paso.tipoTransporte;
                const routeId = paso.routeId;
                const agencyName = paso.agencyName;
                const distance = paso.distance;

                let coordenadas = [];
                let steps = [];

                if (mode !== 'WALK') {
                    coordenadas = paso.coordenadas;
                } else {
                    steps = paso.steps;
                }

                const from = {
                    name: paso.from.name,
                    lat: paso.from.lat,
                    lon: paso.from.lon,
                    cantidadBicicletasDisponibles:
                        paso.from.cantidadBicicletasDisponibles,
                    cantidadPuestosDisponibles:
                        paso.from.cantidadPuestosDisponibles
                };

                const to = await this.parsePasoTo(paso.to);

                if (
                    mode === 'BUS' &&
                    paso.routeId !== 'L1' &&
                    paso.routeId !== 'L2'
                ) {
                    mode = 'FUNICULAR';
                }

                const add_paso = {
                    mode,
                    distance: this.ajustarDistancia(distance),
                    tipoTransporte,
                    routeId,
                    agencyName,
                    from,
                    to,
                    coordenadas,
                    steps,
                    mensaje: this.ajustarDetallePaso(
                        paso,
                        this.itineraries[1].legs,
                        this.contador1
                    ),
                    duration: this.ajustarDuracion(
                        this.itineraries[1].legs[this.contador1]
                    )
                };

                this.contador1++;
                this.mejorTiempo.pasos.push(add_paso);
                this.sumaDistancia2 += paso.distance;
            }
            for (const paso of this.itineraries[0].legs) {
                const mode = paso.mode;
                const tipoTransporte = paso.tipoTransporte;
                const routeId = paso.routeId;
                const agencyName = paso.agencyName;
                const distance = paso.distance;

                let coordenadas = [];
                let steps = [];

                if (mode !== 'WALK') {
                    coordenadas = paso.coordenadas;
                } else {
                    steps = paso.steps;
                }

                if (
                    mode === 'BICYCLE' &&
                    paso.from.bikeShareId &&
                    !this.isEnciclaUsed
                ) {
                    this.isEnciclaUsed = true;
                }

                const from = {
                    name: paso.from.name,
                    lat: paso.from.lat,
                    lon: paso.from.lon,
                    cantidadBicicletasDisponibles:
                        paso.from.cantidadBicicletasDisponibles,
                    cantidadPuestosDisponibles:
                        paso.from.cantidadPuestosDisponibles
                };

                const to = await this.parsePasoTo(paso.to);

                const add_paso = {
                    mode,
                    distance: this.ajustarDistancia(distance),
                    tipoTransporte,
                    routeId,
                    agencyName,
                    from,
                    to,
                    coordenadas,
                    steps,
                    mensaje: this.ajustarDetallePaso(
                        paso,
                        this.itineraries[0].legs,
                        this.contador2
                    ),
                    duration: this.ajustarDuracion(
                        this.itineraries[0].legs[this.contador2]
                    )
                };

                this.contador2++;
                this.mejordistancia.pasos.push(add_paso);
                this.sumaDistancia1 += paso.distance;
            }
        } else {
            this.flagShowBestDistance = true;
            this.flagShowBestTime = false;

            for (const paso of this.itineraries[0].legs) {
                const mode = paso.mode;
                const tipoTransporte = paso.tipoTransporte;
                const routeId = paso.routeId;
                const agencyName = paso.agencyName;
                const distance = paso.distance;
                const { lat, lon } = paso.from;

                let coordenadas = [];
                let steps = [];

                if (mode !== 'WALK') {
                    coordenadas = paso.coordenadas;
                } else {
                    steps = paso.steps;
                }
                if (
                    mode === 'BICYCLE' &&
                    paso.from.bikeShareId &&
                    !this.isEnciclaUsed
                ) {
                    this.isEnciclaUsed = true;
                }

                const from = {
                    name: paso.from.name,
                    lat: paso.from.lat,
                    lon: paso.from.lon,
                    cantidadBicicletasDisponibles:
                        paso.from.cantidadBicicletasDisponibles,
                    cantidadPuestosDisponibles:
                        paso.from.cantidadPuestosDisponibles
                };

                const to = await this.parsePasoTo(paso.to);

                const add_paso = {
                    mode,
                    distance: this.ajustarDistancia(distance),
                    routeId,
                    agencyName,
                    from,
                    to,
                    coordenadas,
                    steps,
                    mensaje: this.ajustarDetallePaso(
                        paso,
                        this.itineraries[0].legs,
                        this.contador2
                    ),
                    duration: this.ajustarDuracion(
                        this.itineraries[0].legs[this.contador2]
                    )
                };

                this.contador2++;
                this.mejordistancia.pasos.push(add_paso);
                this.sumaDistancia1 += paso.distance;
            }
        }
    }

    private codificarDireccion(latlng: { lat; lng }) {
        return GmapsMovilidadService.codificarDireccion(latlng, 'location');
    }

    async parsePasoTo(pasoOobject) {
        const { lat, lon, bikeShareId } = pasoOobject;
        let name;
        let id: any[] = [];
        let cantidadBicicletasDisponibles;
        let cantidadPuestosDisponibles;
        let tipoEstacion;
        const puntoAcceso = 'PUNTO ACCESO';

        if (name === puntoAcceso) {
            name = await this.codificarDireccion({ lat, lng: lon }).then(
                res => res.descripcion
            );
        }

        if (typeof bikeShareId === 'string') {
            id = bikeShareId.split('"');
        }

        if (id && id.length > 1) {
            await this.obtenerDisponibilidadEncicla(id[1]).then(
                (data: DisponibilidadEnciclaResponse) => {
                    cantidadBicicletasDisponibles =
                        data.cantidadBicicletasDisponibles;
                    cantidadPuestosDisponibles =
                        data.cantidadPuestosDisponibles;
                    tipoEstacion = data.tipoEstacion;
                }
            );
        }

        if (cantidadBicicletasDisponibles === 0){
            cantidadBicicletasDisponibles = 1;
        }
        const result = {
            name,
            lat,
            lon,
            cantidadBicicletasDisponibles,
            cantidadPuestosDisponibles
        };

        if (tipoEstacion) {
            return { ...result, tipoEstacion };
        }
        return result;
    }

    ajustarDistancia(distance): string {
        return this.pipe.transform(distance / 1000, '1.2-2');
    }
    // agregar descripcion del detalle de cada paso
    ajustarDetallePaso(paso, data, index): string {
        let message = '';
        console.log(
            'espera',
            paso.mode,
            this.isWaitingTimeUsed,
            this.itineraries[0].waitingTime
        );
        switch (paso.mode) {
            case 'TRAM':
                message = `Toma el ${paso.routeLongName} del ${paso.agencyName} desde ${paso.from.name} a ${paso.to.name}`;
                break;
            case 'RAIL':
                message = `Toma la ${paso.routeLongName} del ${paso.agencyName} en la  ${paso.from.name} a ${paso.to.name}`;
                break;

            case 'WALK':
                if (paso.to.name === 'Destination') {
                    message = `Camina ${this.ajustarDistancia(
                        paso.distance
                    )} km a ${this.destino.descripcion}`;
                } else {
                    if (index < data.length) {
                        index++;
                        const { name, bikeShareId } = paso.to;
                        if (data[index].mode === 'BICYCLE' && bikeShareId) {
                            message = `Camina ${this.ajustarDistancia(
                                paso.distance
                            )} km a estación encicla ${name}`;
                        } else {
                            message = `Camina ${this.ajustarDistancia(
                                paso.distance
                            )} km a ${paso.to.name}`;
                        }
                    } else {
                        message = `Camina ${this.ajustarDistancia(
                            paso.distance
                        )} km a ${paso.to.name}`;
                    }
                }
                break;

            case 'BICYCLE':
                if (index < data.length) {
                    index++;
                    const { name, bikeShareId } = paso.to;
                    const nombreDestino = name.replace(
                        'Destination',
                        'Destino'
                    );

                    if (bikeShareId) {
                        message = `Recorre ${this.ajustarDistancia(
                            paso.distance
                        )} km a estación encicla ${name}`;
                    } else {
                        message = `Recorre ${this.ajustarDistancia(
                            paso.distance
                        )} km a ${nombreDestino}`;
                    }
                } else {
                    message = `Recorre ${this.ajustarDistancia(
                        paso.distance
                    )} km a ${paso.to.name}`;
                }
                break;

            case 'CABLE_CAR':
                message =
                    'Andar ' +
                    this.ajustarDistancia(paso.distance) +
                    ' km a ' +
                    paso.to.name;
                break;
            case 'SUBWAY':
                message = `Toma la ruta de bus ${
                    paso.routeLongName
                } - ${paso.routeShortName || ''} baja del bus en ${
                    paso.to.name
                }`;
                break;
            case 'GONDOLA':
                message = `Toma el ${paso.routeLongName} del ${paso.agencyName} desde ${paso.from.name} a ${paso.to.name}`;
                break;
            case 'FUNICULAR':
                message = `Toma la ruta del integrado ${paso.routeShortName ||
                    ''} - baja del bus en ${paso.routeLongName} del ${
                    paso.agencyName
                } a ${paso.to.name}`;
                break;
            case 'FERRY':
                message = `Toma la ruta del alimentador ${paso.routeShortName ||
                    ''} - baja del bus en  ${paso.routeLongName} del ${
                    paso.agencyName
                } a ${paso.to.name}`;
                break;
            case 'BUS':
                message = `Espera la ruta de bus ${paso.routeLongName} baja del bus en ${paso.to.name}`;
                break;
        }
        return message;
    }

    // detalle del paso con timpos de espera -> se quito los tiempos pero se deja metodo comentado
    /*
    //agregar descripcion del detalle de cada paso
    ajustarDetallePaso(paso, data, index): string {
        let message = "";
        console.log("espera", paso.mode, this.isWaitingTimeUsed, this.itineraries[0].waitingTime);
        debugger;

        switch (paso.mode) {
            case "TRAM":
                if (
                    !this.isWaitingTimeUsed &&
                    this.itineraries[0].waitingTime ||
                    this.itineraries[0].waitingTime == 0
                ) {
                    let waitingTime = this.itineraries[0].waitingTime;
                    let espera = Math.round(waitingTime / 60);
                    if (espera == 0) {
                        message = `Espera menos de 2 mins. aprox., Toma el ${paso.routeLongName} del
                         ${paso.agencyName} desde ${paso.from.name} a ${paso.to.name}`;
                    } else {
                        message = `Espera ${espera} mins. aprox., Toma el ${paso.routeLongName} del
                         ${paso.agencyName} desde ${paso.from.name} a ${paso.to.name}`;
                    }
                    this.isWaitingTimeUsed = true;
                } else {
                    message = `Toma el ${paso.routeLongName} del ${paso.agencyName} desde ${paso.from.name} a ${paso.to.name}`;
                }
                break;

            case "RAIL":
                if (
                    !this.isWaitingTimeUsed &&
                    this.itineraries[0].waitingTime ||
                    this.itineraries[0].waitingTime == 0
                ) {
                    let waitingTime = this.itineraries[0].waitingTime;
                    let espera = Math.round(waitingTime / 60);
                    if (espera == 0) {
                        message = `Espera menos de 2 mins. aprox., Toma la ${paso.routeLongName} del ${paso.agencyName} en la
                          ${paso.from.name} a ${paso.to.name}`;
                    } else {
                        message = `Espera ${espera} mins. aprox., Toma la ${paso.routeLongName} del ${paso.agencyName} en la
                          ${paso.from.name} a ${paso.to.name}`;
                    }
                    this.isWaitingTimeUsed = true;
                } else {
                    message = `Toma la ${paso.routeLongName} del ${paso.agencyName} en la  ${paso.from.name} a ${paso.to.name}`;
                }
                break;

            case "WALK":
                if (paso.to.name == "Destination") {
                    message = `Camina ${this.ajustarDistancia(
                        paso.distance
                    )} km a ${this.destino.descripcion}`;
                } else {
                    if (index < data.length) {
                        index++;
                        const { name, bikeShareId } = paso.to;
                        if (data[index].mode == "BICYCLE" && bikeShareId) {
                            message = `Camina ${this.ajustarDistancia(
                                paso.distance
                            )} km a estación encicla ${name}`;
                        } else {
                            message = `Camina ${this.ajustarDistancia(
                                paso.distance
                            )} km a ${paso.to.name}`;
                        }
                    } else {
                        message = `Camina ${this.ajustarDistancia(
                            paso.distance
                        )} km a ${paso.to.name}`;
                    }
                }
                break;

            case "BICYCLE":
                if (index < data.length) {
                    index++;
                    const { name, bikeShareId } = paso.to;
                    const nombreDestino = name.replace(
                        "Destination",
                        "Destino"
                    );

                    if (bikeShareId) {
                        message = `Recorre ${this.ajustarDistancia(
                            paso.distance
                        )} km a estación encicla ${name}`;
                    } else {
                        message = `Recorre ${this.ajustarDistancia(
                            paso.distance
                        )} km a ${nombreDestino}`;
                    }
                } else {
                    message = `Recorre ${this.ajustarDistancia(
                        paso.distance
                    )} km a ${paso.to.name}`;
                }
                break;

            case "CABLE_CAR":
                message =
                    "Andar " +
                    this.ajustarDistancia(paso.distance) +
                    " km a " +
                    paso.to.name;
                break;

            case "SUBWAY":
                if (
                    !this.isWaitingTimeUsed &&
                    this.itineraries[0].waitingTime ||
                    this.itineraries[0].waitingTime == 0
                ) {
                    let waitingTime = this.itineraries[0].waitingTime;
                    let espera = Math.round(waitingTime / 60);
                    console.log("espera subway", espera);
                    debugger;
                    if (espera == 0) {
                        message = `Espera menos de 2 mins. aprox., Toma la ruta de bus ${paso.routeLongName} -
                         ${paso.routeShortName || ""} baja del bus en ${paso.to.name}`;
                    } else {
                        message = `Espera ${espera} mins. aprox., Toma la ruta de bus ${paso.routeLongName} -
                         ${paso.routeShortName || ""} baja del bus en ${paso.to.name}`;
                    }
                    this.isWaitingTimeUsed = true;
                } else {
                    message = `Toma la ruta de bus ${paso.routeLongName} - ${paso.routeShortName || ""} baja del bus en ${paso.to.name}`;
                }
                break;

            case "GONDOLA":
                if (
                    !this.isWaitingTimeUsed &&
                    this.itineraries[0].waitingTime ||
                    this.itineraries[0].waitingTime == 0
                ) {
                    let waitingTime = this.itineraries[0].waitingTime;
                    let espera = Math.round(waitingTime / 60);
                    if (espera == 0) {
                        message = `Espera menos de 2 mins. aprox., Toma la ${paso.routeLongName} del
                         ${paso.agencyName} desde ${paso.from.name}
            a ${paso.to.name}`;
                    } else {
                        message = `Espera ${espera} mins. aprox. Toma la ${paso.routeLongName} del
                     ${paso.agencyName} desde ${paso.from.name}
            a ${paso.to.name}`;
                    }
                    this.isWaitingTimeUsed = true;
                } else {
                    message = `Toma el ${paso.routeLongName} del ${paso.agencyName} desde ${paso.from.name} a ${paso.to.name}`;
                }
                break;

            case "FUNICULAR":
                if (
                    !this.isWaitingTimeUsed &&
                    this.itineraries[0].waitingTime ||
                    this.itineraries[0].waitingTime == 0
                ) {
                    let waitingTime = this.itineraries[0].waitingTime;
                    let espera = Math.round(waitingTime / 60);
                    if (espera == 0) {
                        message = `Espera menos de 2 mins. aprox., la ruta del integrado ${paso.routeShortName || ""} -
                         baja del bus en ${paso.routeLongName} del ${paso.agencyName}
              a ${paso.to.name}`;
                    } else {
                        message = `Espera ${espera} mins. aprox., la ruta del integrado ${paso.routeShortName || ""} -
                        baja del bus en ${paso.routeLongName} del ${paso.agencyName}
              a ${paso.to.name}`;
                    }
                    this.isWaitingTimeUsed = true;
                } else {
                    message = `Toma la ruta del integrado ${paso.routeShortName || ""} -
                     baja del bus en ${paso.routeLongName} del ${paso.agencyName} a ${paso.to.name}`;
                }
                break;

            case "FERRY":
                if (
                    !this.isWaitingTimeUsed &&
                    this.itineraries[0].waitingTime ||
                    this.itineraries[0].waitingTime == 0
                ) {
                    let waitingTime = this.itineraries[0].waitingTime;
                    let espera = Math.round(waitingTime / 60);

                    if (espera == 0) {
                        message = `Espera menos de 2 mins. aprox., la ruta del alimentador ${paso.routeShortName || ""} -
                         baja del bus en ${paso.routeLongName} del ${paso.agencyName}
              a ${paso.to.name}`;
                    } else {
                        message = `Espera ${espera} mins. aprox., la ruta del alimentador ${paso.routeShortName || ""} -
                         baja del bus en ${paso.routeLongName} del ${paso.agencyName}
              a ${paso.to.name}`;
                    }
                    this.isWaitingTimeUsed = true;
                } else {
                    message = `Toma la ruta del alimentador ${paso.routeShortName || ""} - baja del bus en
                     ${paso.routeLongName} del ${paso.agencyName} a ${paso.to.name}`;
                }
                break;

            case "BUS":
                if (
                    !this.isWaitingTimeUsed &&
                    this.itineraries[0].waitingTime ||
                    this.itineraries[0].waitingTime == 0
                ) {
                    let waitingTime = this.itineraries[0].waitingTime;
                    let espera = Math.round(waitingTime / 60);
                    if (espera == 0) {
                        message = `Espera menos de 2 mins. aprox., la ruta del bus ${paso.routeLongName} baja del bus en ${paso.to.name}`;
                    } else {
                        message = `Espera ${espera}  min. aprox., la ruta del bus ${paso.routeLongName} baja del bus en ${paso.to.name}`;
                    }
                    this.isWaitingTimeUsed = true;
                } else {
                    message = `Espera la ruta de bus ${paso.routeLongName} baja del bus en ${paso.to.name}`;
                }
                break;
        }
        return message;
    }
    */

    ajustarDuracion({ duration }) {
        let hours = Math.floor(duration / 3600);
        let minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;

        let mensaje = '';

        if (hours !== 0) {
            if (minutes !== 0) {
                if (seconds > 30) {
                    minutes++;

                    if (minutes === 60) {
                        hours++;
                        mensaje = hours + ' h.';
                    } else {mensaje = hours + ' h ' + minutes + ' min.'; }
                } else {
                    mensaje = hours + ' h ' + minutes + ' min.';
                }
            } else {
                mensaje = hours + ' h.';
            }
        } else {
            if (seconds > 30) {
                minutes++;

                if (minutes === 60) {mensaje = '1 h.'; }
                else {mensaje = minutes + ' min.'; }
            } else {
                mensaje = minutes + ' min.';
            }
        }

        /*if(hours.length == 1){
            hours = "0" + hours;
        }

        if(minutes.length == 1){
            minutes = "0" + minutes;
        }

        if(seconds.length == 1){
            seconds = "0" + seconds;
        }

        return `${hours}:${minutes}:${seconds}`; */
        return mensaje;
    }

    convertirtiempo() {
        if (this.itineraries.length === 2) {
            const time =
                this.itineraries[1].duration - this.itineraries[1].waitingTime;
            this.mejorTiempoDuracion = this.ajustarDuracionParaTiempoTotal(
                time
            );

            let hours = Math.floor(time / 3600) + '';
            let minutes = Math.floor((time % 3600) / 60) + '';
            let seconds = (time % 60) + '';

            if (hours.length === 1) {
                hours = '0' + hours;
            }

            if (minutes.length === 1) {
                minutes = '0' + minutes;
            }

            if (seconds.length === 1) {
                seconds = '0' + seconds;
            }

            this.mejorTiempo.duracion = hours + ':' + minutes + ':' + seconds;

            const time2 =
                this.itineraries[0].duration - this.itineraries[0].waitingTime;
            this.mejordistanciaDuracion = this.ajustarDuracionParaTiempoTotal(
                time2
            );

            let hours2 = Math.floor(time2 / 3600) + '';
            let minutes2 = Math.floor((time2 % 3600) / 60) + '';
            let seconds2 = (time2 % 60) + '';

            if (hours2.length === 1) {
                hours2 = '0' + hours2;
            }

            if (minutes2.length === 1) {
                minutes2 = '0' + minutes2;
            }

            if (seconds2.length === 1) {
                seconds2 = '' + seconds2;
            }

            this.mejordistancia.duracion =
                hours2 + ':' + minutes2 + ':' + seconds2;
        } else {
            const time2 =
                this.itineraries[0].duration - this.itineraries[0].waitingTime;
            this.mejordistanciaDuracion = this.ajustarDuracionParaTiempoTotal(
                time2
            );

            let hours2 = Math.floor(time2 / 3600) + '';
            let minutes2 = Math.floor((time2 % 3600) / 60) + '';
            let seconds2 = (time2 % 60) + '';

            if (hours2.length === 1) {
                hours2 = '0' + hours2;
            }

            if (minutes2.length === 1) {
                minutes2 = '0' + minutes2;
            }

            if (seconds2.length === 1) {
                seconds2 = '0' + seconds2;
            }

            this.mejordistancia.duracion =
                hours2 + ':' + minutes2 + ':' + seconds2;
        }
    }

    ajustarDuracionParaTiempoTotal(duration) {
        let hours = Math.floor(duration / 3600);
        let minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;

        let mensaje = '';

        if (hours !== 0) {
            if (minutes !== 0) {
                if (seconds > 30) {
                    minutes++;

                    if (minutes === 60) {
                        hours++;
                        mensaje = hours + ' h.';
                    } else {mensaje = hours + ' h ' + minutes + ' min.'; }
                } else {
                    mensaje = hours + ' h ' + minutes + ' min.';
                }
            } else {
                mensaje = hours + ' h.';
            }
        } else {
            if (seconds > 30) {
                minutes++;

                if (minutes === 60) {mensaje = '1 h.'; }
                else {mensaje = minutes + ' min.'; }
            } else {
                mensaje = minutes + ' min.';
            }
        }

        return mensaje;
    }

    convertirDistancia() {
        const pasos = this.itineraries[0].legs;
        let distance = this.parseDistance(pasos);
        distance = Number(distance.toFixed()) / 1000;
        const distancia = distance.toFixed(2);
        this.mejordistancia.distancia = `${distancia}`;
    }

    parseDistance(pasos) {
        let distance = 0;
        for (const paso of pasos) {
            if (paso.distance) {
                distance = distance + paso.distance;
            }
        }
        return distance;
    }

    mostrarModalDetalleViaje(viaje, position) {
        if (position === 1) {
            this.tarifaTotalViaje = this.response.plan.itineraries[0].rate;
        } else {
            if (this.response.plan.itineraries.length === 0) {
                this.tarifaTotalViaje = this.response.plan.itineraries[0].rate;
                return;
            }
            this.tarifaTotalViaje = this.response.plan.itineraries[1].rate;
        }

        const dataParams = {
            viaje,
            origen: this.origen,
            destino: this.destino,
            kilometrajeAuto: '',
            tarifaTotalViaje: this.tarifaTotalViaje,
            flag_show_sidemenu: this.flag_show_sidemenu,
            itinerarios: this.itineraries,
            root: this.root,
            tiempoDuracion:
                position === 2
                    ? this.mejorTiempoDuracion
                    : this.mejordistanciaDuracion
        };

        if (this.kilometrajeAuto) {
            dataParams.kilometrajeAuto = this.kilometrajeAuto.toFixed(2);
        }

        // this.navCtrl.push(DetalleViajePage, dataParams);
        this.router.navigate(['/detalle-viaje', dataParams]);
    }

    onResponseViajesSugeridos(response: any) {
        this.isEnciclaUsed = false;
        this.alternativaViaje = false;
        this.cargarUbicacionInicioDestino(
            response.lat_origen,
            response.lon_origen,
            response.ori_desc,
            response.lat_destino,
            response.lon_destino,
            response.des_desc
        );
        this.response = response.data;
        this.cargarDatos(response.data, response.mensaje);
    }

    isLayerActive(layer: number): boolean {
        return layer === this.layerActive;
    }

    getStyleClass(layer: number): string {
        return layer === this.layerActive ? 'layer-active' : 'layer-unactive';
    }

    private searchDisponibilidadEncicla(
        idEstacion: any
    ): DisponibilidadEnciclaRequest {
        return new DisponibilidadEnciclaRequest('token', idEstacion, 'fecha');
    }

    private obtenerDisponibilidadEncicla(idEstacion) {
        const data: DisponibilidadEnciclaRequest = this.searchDisponibilidadEncicla(
            idEstacion
        );

        return this.wsMovilidad
            .obtenerDisponibilidadEnciclaPromise(data)
            .then(result => result as DisponibilidadEnciclaResponse)
            .catch(err => {
                return err;
            });
    }
    public getImgDetail(item: any, preferenciasTransportes: any): any {
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
                if (cantidadBicicletasDisponibles || this.isEnciclaUsed) {
                    const preferencia = this.getTransportModeById(
                        5,
                        preferenciasTransportes
                    );
                    modoTransporte.imagen = preferencia[0].urlIconEnabled;
                    modoTransporte.color = '#FF000F';
                    this.isEnciclaUsed = true;
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
