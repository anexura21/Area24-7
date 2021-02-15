import { DisponibilidadEnciclaResponse } from '../../../entities/movilidad/disponibilidad-encicla-response';
import { OtherLayerComponent } from '../../../components/other-layer/other-layer.component';
import { DetalleRutasCercanasComponent } from '../../../components/detalle-rutas-cercanas/detalle-rutas-cercanas.component';
import { MapaComponent } from '../../../components/mapa/mapa.component';
import { TransportMode } from '../../../entities/transport-mode';
import { timeout, timeoutWith } from 'rxjs/operators';
import { MapService } from '../../../providers/map.service';
import { ModoEstacion } from '../../../entities/movilidad/constantes';
import { DisponibilidadEnciclaRequest } from '../../../entities/movilidad/disponibilidad-encicla-request.model';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { MenuFavoritoPopoverComponent } from '../../../components/menu-favorito-popover/menu-favorito-popover.component';
import { UbicacionFavoritaPage } from '../../ubicacion-favorita/ubicacion-favorita.page';
import { GmapsMovilidadService } from '../../../providers/movilidad/gmaps-movilidad.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { OtherLayer } from '../../../entities/other-layer';
import { MessageService } from '../../../providers/message.service';
import { LocationChangeService } from '../../../providers/location-change.service';
import { LocationUpdateService } from '../../../providers/location-update.service';
import { ToastController, PopoverController, NavController, ModalController } from '@ionic/angular';
import { LayerService } from '../../../providers/layer.service';
import { Common } from '../../../shared/utilidades/common.service';
import { WsMovilidadService } from '../../../providers/movilidad/ws-movilidad.service';
import { GooglemapsService } from '../../../providers/googlemaps.service';
import { RutasCercanasRequest } from '../../../entities/movilidad/rutas-cercanas-request.model';
import { RutasCercanasReponse } from '../../../entities/rutas-cercanas-response.model';
import { MODOS_BUSQUEDA, Ubicacion } from '../../../entities/movilidad/ubicacion.model';
import { UbicacionFavorita } from '../../../entities/movilidad/ubicacion-favorita.model';
import { AppLayer } from '../../../entities/app-layer';
import { Subscription, BehaviorSubject } from 'rxjs';
import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
declare var google;
@Component({
  selector: 'menu-rutas',
  templateUrl: './menu-rutas.page.html',
//   styleUrls: ['./menu-rutas.page.scss'],
})
export class MenuRutasPage implements OnInit, OnDestroy {

  static readonly LOCATION_UPDATES_INTERVAL: number = 5000;
  static readonly DISTANCE_TOLERANCE: number = 0;

  @Output()
  outClickRutas ? = new EventEmitter();
  @Output()
  outClickLineas ? = new EventEmitter();
  @Output()
  outClickCiclovias ? = new EventEmitter();

  rutas: Array<{}>;
  ubicacion: Ubicacion = new Ubicacion();
  ubicacion_actual: Ubicacion = new Ubicacion();

  showDetalle: boolean;
  showPuntos: boolean;
  origen?: any;
  modalOrigen: any;
  items: any;
  imgDetalle: any;
  txtDetalle: any;
  preferenciasTransportes: any;
  checked = false;
  showMenu = false;
  rutasCercanas = false;
  activeCard = false;
  ubicacionesFavoritas: UbicacionFavorita[];
  ubicacionFavoritaPage: any;
  sessionStart = true;

  markers = [];
  estaciones = [];
  lineas = [];
  paraderos = [];
  puntosCivica = [];

  markersPuntoRecarga = [];
  puntosRutas: RutasCercanasReponse;
  rutasCercanasRequest: RutasCercanasRequest;
  cardActiveValue = 0;

  // ciclo parqueaderos
  private cicloParqueaderosSubscription: Subscription;
  private getMarkerInfoSubscription: Subscription;

  espacioPublico = [];
  estacionesSITVA = [];
  espaciosDeportivos = [];
  equipamientos = [];
  parques = [];

  markersEspacioPublico = [];
  markersEstacionesSITVA = [];
  markersEspaciosDeportivos = [];
  markersEquipamientos = [];
  markersParques = [];
  // end ciclo parqueaderos

  public actionRadius: number;
  public app: any = this;
  public titulo: string;

  public subscriptionLayerNumber: Subscription;

  public rutasActive: boolean;
  public lineasActive: boolean;
  public cicloActive: boolean;
  public puntosActive: boolean;
  public cicloParqueaderosActive: boolean;

  public sidebarEvent: any;
  public radiusEvent: any;
  public markerEvent: any;
  public draggedEvent: any;

  autocompleteItems: any[];
  acService: any;

  public imgRutas = 'assets/movilidad/iconos/bus.png';
  public imgLineas = 'assets/movilidad/iconos/tranvia.png';
  public imgCiclovias = 'assets/movilidad/iconos/encicla.png';
  public imgpuntos =
      'assets/movilidad/markers/civicarecargaMarker.png';
  public txtRutas: any;
  public txtLineas: any;
  public txtCiclovias: any;
  public txtpuntos: any;
  private locationUpdateSubscription: Subscription;
  private firstLocationCenterMap = false;
  public appLayer: AppLayer;
  public currentPosition = new BehaviorSubject<{
      lat: number;
      lng: number;
  }>({ lat: 0, lng: 0 });

  public categorias: any;
  public mostrarCampoBusqueda = false;

  // lat y long para enviar al detalle de rutas cercanas
  public lat = 0;
  public lng = 0;
  appId;
  contadorDeAlertas = 0;
  mostrarAlerta = true;

  constructor(
    public googleMaps: GooglemapsService,
    public wsMovilidad: WsMovilidadService,
    private utilidades: Common,
    private layerProvider: LayerService,
    private toastCtrl: ToastController,
    private popoverCtrl: PopoverController,
    private locationUpdate: LocationUpdateService,
    private locationChange: LocationChangeService,
    private messageProvider: MessageService,
    private router: ActivatedRoute,
    private route: Router,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {
    this.ubicacion.txtPlaceholder = 'Ubicación';
    this.ubicacion.longitud = 0;
    this.ubicacion.latitud = 0;
    this.puntosRutas = null;
    this.acService = new google.maps.places.AutocompleteService();
    this.router.queryParams.subscribe( params => {
        this.appLayer = new AppLayer(null);
        this.titulo = params['nomApp'];
        this.appLayer.color = params['color'];
        this.appId = Number(params['appId']);
    });
    this.layerProvider.getMenu().subscribe(data => {
      const apps = AppLayer.parseApps(Object.values(data));
      this.appLayer = apps.find(app => app.id === this.appId);
      console.log(this.appLayer);
  });
    // this.titulo = this.appLayer.children.find(
    //     (layer: OtherLayer) => layer.layerType === 'MAPA DE RUTAS CERCANAS'
    // ).name;

    this.obtenerPuntosCicloParqueaderos();
  }

  ngOnInit() {
    this.actionRadius = GmapsMovilidadService.obtenerRadio();
    this.subscribeServices();
    this.rutasActive = false;
    this.lineasActive = false;
    this.cicloActive = false;
    this.puntosActive = false;
    this.cicloParqueaderosActive = false;

    this.ubicacion.latitud = 0;
    this.ubicacion.longitud = 0;
    this.ubicacion.descripcion = '';

    this.onClickMyLocationButton();
  }

  // metodos de ubicacion actual
  async onClickMyLocationButton() {
    // let geoposition: Geoposition = this.locationChange.getGeoposition();

    const geoposition: {
        lat: number;
        lng: number;
        time: number;
    } = await this.locationUpdate.getCurrentGeoposition();

    /* let geoposition: Geoposition = this.locationChange.getGeoposition(); */

    MapService.map.panTo(
        new google.maps.LatLng(geoposition.lat, geoposition.lng)
    );

    setTimeout(() => {
        this.ubicacion.latitud = geoposition.lat;
        this.ubicacion.longitud = geoposition.lng;
        this.ubicacion.descripcion = 'Mi Ubicación';

        this.mostrarCampoBusqueda = true;
        this.updateCreatePositionMarker(this.ubicacion);
        this.turnOnLocationUpdates();
    }, 500);
}

turnOnLocationUpdates(): void {
    if (
        this.locationUpdateSubscription &&
        !this.locationUpdateSubscription.closed
    ){
        return; }

    this.locationUpdateSubscription = this.locationUpdate
        .getObservable(
            MenuRutasPage.DISTANCE_TOLERANCE,
            MenuRutasPage.LOCATION_UPDATES_INTERVAL
        )
        .subscribe((latLng: { lat: number; lng: number }): void => {
            console.log(
                'new location update in encicla' + JSON.stringify(latLng)
            );
            this.ubicacion.latitud = latLng.lat;
            this.ubicacion.longitud = latLng.lng;
            this.ubicacion.descripcion = 'Mi Ubicación';

            if (!this.firstLocationCenterMap) {
                this.firstLocationCenterMap = true;
                const latLng_: google.maps.LatLng = new google.maps.LatLng(
                    latLng.lat,
                    latLng.lng
                );
                MapService.map.setCenter(latLng_);
            }
            this.updateCreatePositionMarker(this.ubicacion);
        });
    console.log(
        MenuRutasPage.name +
            ' turnOnLocationUpdates ' +
            this.locationUpdateSubscription.closed
    );
}

turnOffLocationUpdates(): void {
    if (this.locationUpdateSubscription){
        this.locationUpdateSubscription.unsubscribe(); }
}
// fin


ionViewDidEnter() {
    const idUsuario = this.utilidades.obtenerUsuarioActivo().id;
    this.onObtenerUbicacionesFavoritas(idUsuario);
    this.markers = [];
}

obtenerPuntosCicloParqueaderos() {
    this.cicloParqueaderosSubscription = this.wsMovilidad
        .obtenerPuntosCicloParqueaderos()
        .pipe(timeout(1000))
        .subscribe(
            (data: any) => {
                console.log('obtenerPuntosCicloParqueaderos', data);
                this.espacioPublico = data[0].markersPoint;
                this.estacionesSITVA = data[1].markersPoint;
                this.espaciosDeportivos = data[2].markersPoint;
                this.equipamientos = data[3].markersPoint;
                this.parques = data[4].markersPoint;
            },
            err => {
                this.utilidades.basicAlert(
                    'Movilidad',
                    'Ocurrió un inconveniente inténtelo nuevamente'
                );
            }
        );
}

seleccionarPrediccion(item: any) {
    this.utilidades.presentLoading();
    GmapsMovilidadService.codificarDireccion(item.description, 'address')
        .then(data => {
            this.utilidades.dismissLoading();

            this.ubicacion.latitud = data.latitud;
            this.ubicacion.longitud = data.longitud;
            this.ubicacion.descripcion = item.description;

            this.autocompleteItems = [];
            this.updateCreatePositionMarker(this.ubicacion);
        })
        .catch(error => {
            this.messageProvider
                .getByNombreIdentificador('inconveniente_movilidad')
                .subscribe((response: any): void => {
                    const msg = response.json();
                    this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                    this.utilidades.dismissLoading();
                });
        });
}

subscribeServices(): void {
    this.radiusEvent = this.layerProvider.currentAppChange$.subscribe(
        (app: AppLayer) => {
            this.actionRadius = app.radius;
            GmapsMovilidadService.setRadio(this.actionRadius);
            if (
                this.ubicacion.longitud !== 0 &&
                this.ubicacion.latitud !== 0
            ) {
                this.updateCreatePositionMarker(this.ubicacion);
            }
        }
    );

    this.sidebarEvent = this.layerProvider.transportModesChange$.subscribe(
        (transportsPreferences: TransportMode[]) => {
            this.preferenciasTransportes = transportsPreferences;
        }
    );

    this.draggedEvent = MapaComponent.dragedPedestrian$.subscribe(
        ({ lat, lng }) => {
            if (lat !== 0 && lng !== 0 && !this.sessionStart) {
                this.ubicacion.latitud = lat;
                this.ubicacion.longitud = lng;
                this.codificarDireccion({ lat, lng });
                this.deleteAllMapMarkers();
                this.updateCreatePositionMarker(this.ubicacion);
            } else {
                this.sessionStart = !this.sessionStart;
            }
        }
    );

    this.markerEvent = GmapsMovilidadService.markerClick$.subscribe(
        (data: any) => {
            data['ubicacion'] = this.ubicacion;
            this.showDetailModal(data);
        }
    );

    const layer = this.appLayer.children.find(
        (layerAux: OtherLayer) => layerAux.layerType === 'MAPA DE RUTAS CERCANAS'
    );

    this.subscriptionLayerNumber = this.layerProvider
        .getNLayer('CATEGORIA', layer.id)
        .subscribe(
            response => {
                const res = response;
                this.categorias = res;
                console.log(this.categorias);
                this.txtRutas = this.categorias.find(
                    categoria => categoria.id === 444
                );
                this.txtLineas = this.categorias.find(
                    categoria => categoria.id === 481
                );
                this.txtCiclovias = this.categorias.find(
                    categoria => categoria.id === 447
                );
                this.txtpuntos = this.categorias.find(
                    categoria => categoria.id === 482
                );
            },
            error => {
                console.log(error);
            }
        );
}

async showDetailModal(data: any) {
    this.deleteAllMapMarkers();
    const modalDetail = await this.modalCtrl.create({
        component: DetalleRutasCercanasComponent,
        componentProps: { data, app: this.appLayer, lat: this.lat, lng: this.lng }
    });
    modalDetail.onDidDismiss().then(() => {
        this.establecerUbicacion(this.ubicacion);
    });
    return modalDetail.present();
}

buscarDireccion(event: any) {
    if (event.keyCode === 13) {
        const item = { description: this.ubicacion.descripcion };
        this.seleccionarPrediccion(item);
    }
}

ngOnDestroy() {
    if (this.sidebarEvent) {this.sidebarEvent.unsubscribe(); }
    if (this.markerEvent) {this.markerEvent.unsubscribe(); }
    if (this.radiusEvent) {this.radiusEvent.unsubscribe(); }
    if (this.draggedEvent) {this.draggedEvent.unsubscribe(); }
    GmapsMovilidadService.deleteLocationMarker();

    if (this.getMarkerInfoSubscription) {this.getMarkerInfoSubscription.unsubscribe(); }
    if (this.cicloParqueaderosSubscription) {this.cicloParqueaderosSubscription.unsubscribe(); }

    this.deleteAllMapMarkers();
    this.markers = [];
    this.markersEspacioPublico = [];
    this.markersEstacionesSITVA = [];
    this.markersEspaciosDeportivos = [];
    this.markersEquipamientos = [];
    this.markersParques = [];

    OtherLayerComponent.layerTypeCurrentlyActive = undefined;
    this.rutasActive = false;
    this.lineasActive = false;
    this.cicloActive = false;
    this.puntosActive = false;
    this.showDetalle = false;
    this.cicloParqueaderosActive = false;

    if (this.locationUpdateSubscription){
        this.locationUpdateSubscription.unsubscribe(); }
    this.utilidades.dismissLoading();

    this.turnOffLocationUpdates();
}

centrarMapa(data: any, zoom: number) {
    const map = GmapsMovilidadService.getMapa();
    const latlng = new google.maps.LatLng(data.latitud, data.longitud);
    map.setCenter(latlng);
    map.setZoom(zoom);
}

onObtenerDisponibilidadEncicla(
    data: DisponibilidadEnciclaRequest,
    marker: any
) {
    this.wsMovilidad.obtenerDisponibilidadEncicla(data).subscribe(
        succces => {
            this.utilidades.dismissLoading();
            const dataAux = succces as DisponibilidadEnciclaResponse;

            marker.dataRutaCercana.cantidadPuestosDisponibles =
                dataAux.cantidadPuestosDisponibles;
            marker.dataRutaCercana.cantidadBicicletasDisponibles =
                dataAux.cantidadBicicletasDisponibles;
            const infoWindow = GmapsMovilidadService.crearInfoWindow(
                marker.dataRutaCercana,
                marker
            );
        },
        error => {
            this.messageProvider
                .getByNombreIdentificador('inconveniente_movilidad')
                .subscribe((response: any): void => {
                    const msg = response.json();
                    this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                    this.utilidades.dismissLoading();
                });
        }
    );
}

updateSearch() {
    try {
        if (this.ubicacion.descripcion === '') {
            this.autocompleteItems = [];
            return;
        }
        const self = this;

        const defaultBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(6.075967, -75.633433),
            new google.maps.LatLng(6.450092, -75.323971)
        );

        const config = {
            input: self.ubicacion.descripcion,
            bounds: defaultBounds,
            componentRestrictions: { country: 'CO' }
        };

        this.acService.getPlacePredictions(config, (
            predictions,
            status
        ) => {
            self.autocompleteItems = [];
            if (predictions != null) {
                predictions.forEach((prediction) => {
                    self.autocompleteItems.push(prediction);
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

onClickRutas() {
    // debugger;
    this.rutasActive = !this.rutasActive;
    const id = document.getElementById('rutasCard');
    id.classList.toggle('enabled');

    if (this.puntosRutas != null && this.puntosRutas.paraderos.length > 0) {
        this.pintarMarkersByFiltro();
    } else {
        if (this.rutasActive) {
            this.messageProvider
                .getByNombreIdentificador('no_resultado_rutas')
                .subscribe((response: any): void => {
                    const msg = response;
                    this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                });
        }
    }
}

onClickCicloParqueaderos() {
    this.cicloParqueaderosActive = !this.cicloParqueaderosActive;
    const id = document.getElementById('cicloParqueaderosCard');
    id.classList.toggle('enabled');

    if (
        (this.espacioPublico != null && this.espacioPublico.length > 0) ||
        (this.estacionesSITVA != null && this.estacionesSITVA.length > 0) ||
        (this.espaciosDeportivos != null &&
            this.espaciosDeportivos.length > 0) ||
        (this.equipamientos != null && this.equipamientos.length > 0) ||
        (this.parques != null && this.parques.length > 0)
    ) {
        this.pintarPuntosCicloParqueaderos();
    } else {
        if (this.cicloParqueaderosActive) {
            this.utilidades.basicAlert(
                'Ups!',
                'No hay puntos de cicloparqueaderos cercanos a tu ubicación.'
            );
        }
    }
}

onClickLineas() {
    this.lineasActive = !this.lineasActive;
    const id = document.getElementById('lineaCard');
    id.classList.toggle('enabled');

    if (this.puntosRutas != null && this.puntosRutas.lineas.length > 0) {
        this.pintarMarkersByFiltro();
    } else {
        if (this.lineasActive) {
            this.messageProvider
                .getByNombreIdentificador('lineas_cercanas_error')
                .subscribe((response: any): void => {
                    const msg = response;
                    this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                });
        }
    }
}

onClickBikes() {
    let estacionesEncicla;
    this.cicloActive = !this.cicloActive;
    const id = document.getElementById('bikeCard');
    id.classList.toggle('enabled');

    if (this.puntosRutas != null) {
        estacionesEncicla = this.puntosRutas.estaciones.filter(
            estacion => estacion.nombreModoEstacion === 'ENCICLA'
        );
    }
    if (estacionesEncicla != null && estacionesEncicla.length > 0) {
        this.pintarMarkersByFiltro();
    } else {
        if (this.cicloActive) {
            this.messageProvider
                .getByNombreIdentificador('no_resultado_encicla')
                .subscribe((response: any): void => {
                    const msg = response;
                    this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                });
            this.lineasActive = false;
        }
    }
}

onClickPuntos() {
    this.puntosActive = !this.puntosActive;
    const id = document.getElementById('puntosCard');
    id.classList.toggle('enabled');

    if (
        this.puntosRutas != null &&
        this.puntosRutas.puntosTarjetaCivica.length > 0
    ) {
        this.pintarMarkersByFiltro();
    } else {
        if (this.puntosActive) {
            this.messageProvider
                .getByNombreIdentificador('no_resultado_recarga')
                .subscribe((response: any): void => {
                    const msg = response;
                    this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                });
        }
    }
}

onClickOpcionMenu(event) {
    this.showDetalle = !this.showDetalle;
    this.showPuntos = false;
    this.setDetalles(event);
}

private pintarMarkersByFiltro() {
    GmapsMovilidadService.eliminarMarkersPolylines(this.markers);
    this.markers = [];
    this.parseRutasCercanas();
}

private pintarPuntosCicloParqueaderos() {

    // agregar markers para espacio publico
    if (this.cicloParqueaderosActive && this.espacioPublico.length > 0) {
        // for (let i = 0; i < this.espacioPublico.length; i++) {
        for (const markerEP of this.espacioPublico ) {
            const data = markerEP;
            const marker = this.apiMarkerToGoogleMarker(data);
            this.markersEspacioPublico.push(marker);
        }

        this.setMarkersVisibleByRadius(this.markersEspacioPublico);
    } else {
        this.limpiarMarkers(this.markersEspacioPublico);
        this.markersEspacioPublico = [];
    }

    // agregar markers para estaciones SITVA
    if (this.cicloParqueaderosActive && this.estacionesSITVA.length > 0) {
        // for (let i = 0; i < this.estacionesSITVA.length; i++) {
        for ( const markerSITVA of this.estacionesSITVA ) {
            const data = markerSITVA;
            const marker = this.apiMarkerToGoogleMarker(data);
            this.markersEstacionesSITVA.push(marker);
        }

        this.setMarkersVisibleByRadius(this.markersEstacionesSITVA);
    } else {
        this.limpiarMarkers(this.markersEstacionesSITVA);
        this.markersEstacionesSITVA = [];
    }

    // agregar markers para espacios deportivos
    if (
        this.cicloParqueaderosActive &&
        this.espaciosDeportivos.length > 0
    ) {
        // for (let i = 0; i < this.espaciosDeportivos.length; i++) {
        for ( const espacioDeportivo of this.espaciosDeportivos ) {
            const data = espacioDeportivo;
            const marker = this.apiMarkerToGoogleMarker(data);
            this.markersEspaciosDeportivos.push(marker);
        }

        this.setMarkersVisibleByRadius(this.markersEspaciosDeportivos);
    } else {
        this.limpiarMarkers(this.markersEspaciosDeportivos);
        this.markersEspaciosDeportivos = [];
    }

    // agregar markers para equipamientos
    if (this.cicloParqueaderosActive && this.equipamientos.length > 0) {
        // for (let i = 0; i < this.equipamientos.length; i++) {
        for ( const equipamiento of this.equipamientos ) {
            const data = equipamiento;
            const marker = this.apiMarkerToGoogleMarker(data);
            this.markersEquipamientos.push(marker);
        }

        this.setMarkersVisibleByRadius(this.markersEquipamientos);
    } else {
        this.limpiarMarkers(this.markersEquipamientos);
        this.markersEquipamientos = [];
    }

    // agregar markers para parques
    if (this.cicloParqueaderosActive && this.parques.length > 0) {
        // for (let i = 0; i < this.parques.length; i++) {
        for ( const parque of this.parques ) {
            const data = parque;
            const marker = this.apiMarkerToGoogleMarker(data);
            this.markersParques.push(marker);
        }

        this.setMarkersVisibleByRadius(this.markersParques);
    } else {
        this.limpiarMarkers(this.markersParques);
        this.markersParques = [];
    }
}

limpiarMarkers(markersLimpiar) {
    if (markersLimpiar !== undefined) {
        markersLimpiar.forEach((marker: google.maps.Marker) => {
            marker.setMap(null);
        });
    }
}


setMarkersVisibleByRadius(markersPintar): void {
    if (
        markersPintar !== undefined &&
        this.ubicacion.latitud !== -1 &&
        this.ubicacion.longitud !== -1
    ) {
        const originLatLng: google.maps.LatLng = new google.maps.LatLng(
            this.ubicacion.latitud,
            this.ubicacion.longitud
        );

        this.contadorDeAlertas++;

        markersPintar.forEach((marker: google.maps.Marker) => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                originLatLng,
                marker.getPosition()
            );
            marker.setVisible(distance <= this.actionRadius);
        });
    }

    if (this.contadorDeAlertas % 5 === 0) {
        this.contadorDeAlertas = 0;
        this.validarMarkersActivos();
    }
}

// se valida si hay puntos para mostrar en el rango de accion, sino hay puntos se muestra
// alerta informando que no hay puntos cercanos
validarMarkersActivos() {
    // for (let i = 0; i < this.markersEspacioPublico.length; i++) {
    for ( const markerEspacioPublico of this.markersEspacioPublico) {
        const marker = markerEspacioPublico;
        if (marker.getVisible()) {
            this.mostrarAlerta = false;
            break;
        } else {
            this.mostrarAlerta = true; }
    }

    if (this.mostrarAlerta) {
        // for (let i = 0; i < this.markersEstacionesSITVA.length; i++) {
        for ( const markerEstacionesSITVA of this.markersEstacionesSITVA) {
            const marker = markerEstacionesSITVA;
            if (marker.getVisible()) {
                this.mostrarAlerta = false;
                break;
            } else {
                this.mostrarAlerta = true; }
        }
    }

    if (this.mostrarAlerta) {
        // for (let i = 0; i < this.markersEspaciosDeportivos.length; i++) {
        for ( const markerEspaciosDeportivos of this.markersEspaciosDeportivos) {
            const marker = markerEspaciosDeportivos;
            if (marker.getVisible()) {
                this.mostrarAlerta = false;
                break;
            } else {
                this.mostrarAlerta = true; }
        }
    }

    if (this.mostrarAlerta) {
        // for (let i = 0; i < this.markersEquipamientos.length; i++) {
        for ( const markerEquipamiento of this.markersEquipamientos) {
            const marker = markerEquipamiento;
            if (marker.getVisible()) {
                this.mostrarAlerta = false;
                break;
            } else {
                this.mostrarAlerta = true; }
        }
    }

    if (this.mostrarAlerta) {
        // for (let i = 0; i < this.markersParques.length; i++) {
        for ( const markerParque of this.markersParques) {
            const marker = markerParque;
            if (marker.getVisible()) {
                this.mostrarAlerta = false;
                break;
            } else {
                this.mostrarAlerta = true; }
        }
    }

    console.log('mostrarAlerta', this.mostrarAlerta);
    // debugger;

    if (this.mostrarAlerta) {
        this.utilidades.basicAlert(
            'Ups!',
            'No hay puntos de cicloparqueaderos cercanos a tu ubicación.'
        );
    }
}

apiMarkerToGoogleMarker(json: any): google.maps.Marker {
    const marker = new google.maps.Marker({
        position: new google.maps.LatLng(json.point.lat, json.point.lng),
        map: MapService.map,
        icon: {
            url: 'assets/movilidad/markers/markercicloparqueadero.svg',
            scaledSize: new google.maps.Size(32, 32)
        },
        visible: false
    });

    marker['id'] = json.idMarker;

    marker.addListener('click', (args: any = {}) => {
        this.lat = args.latLng.lat();
        this.lng = args.latLng.lng();
        GmapsMovilidadService.getGeometryInfoAndShowInfoWindow(marker, this.layerProvider);
    });
    return marker;
}


// se comenta metodo para carga de info window de ciclo parqueaderos
/* showInfoWindow(info: any, latLng: any): void {
    console.log('informacion del marcador', info)

    let posicion1: number;
    let posicion2: number;
    let idDocument: string = '';
    let idImagen: string = '';
    let imagen: string;
    if (info.rutaImagen != null) {
        if (info.rutaImagen.length > 2 && info.rutaImagen != " ") {
            for (let index = 0; index < info.rutaImagen.length; index++) {
                const element = info.rutaImagen[index];
                if (element == 'd' && info.rutaImagen[index + 1] == '/') {
                    posicion1 = index + 2;
                }
                if (element == '/' && info.rutaImagen[index - 1] != '/' && info.rutaImagen[index + 1] == 'v') {
                    posicion2 = index - 1;
                }
            }

            for (let index = 0; index < info.rutaImagen.length; index++) {
                const element = info.rutaImagen[index];
                if (index >= posicion1 && index <= posicion2) {
                    idDocument = idDocument + element;
                }
            }
            if (idDocument != '') {
                idImagen = `https://drive.google.com/uc?export=view&id=${idDocument}`;
                info.rutaImagen = idImagen;
                imagen = idImagen;
            }
            else {
                imagen = info.rutaImagen;
            }
        }
        else {
            imagen = info.rutaImagen;
        }
    }
    else {
        imagen = info.rutaImagen;
    }
    let posicion11: number;
    let posicion22: number;
    let idDocument2: string = '';
    let idImagen2: string = '';
    if (info.rutaImagen2 != null) {
        if (info.rutaImagen2.length > 2 && info.rutaImagen2 != " ") {
            for (let index = 0; index < info.rutaImagen2.length; index++) {
                const element = info.rutaImagen2[index];
                if (element == 'd' && info.rutaImagen2[index + 1] == '/') {
                    posicion11 = index + 2;
                }
                if (element == '/' && info.rutaImagen2[index - 1] != '/' && info.rutaImagen2[index + 1] == 'v') {
                    posicion22 = index - 1;
                }
            }
            for (let index = 0; index < info.rutaImagen2.length; index++) {
                const element = info.rutaImagen2[index];
                if (index >= posicion11 && index <= posicion22) {
                    idDocument2 = idDocument2 + element;
                }
            }
            if (idDocument2 != '') {
                idImagen2 = `https://drive.google.com/uc?export=view&id=${idDocument}`;
                info.rutaImagen2 = idImagen2;
            }
        }
    }

    let contentString = `
            <style>
                .gm-style-iw {
                    height: 70px !important;
                    width:100%!important;
                    max-width:100%!important;
                    max-height:70px!important;
                    min-height: 86px !important;
                }
                .gm-style .gm-style-iw-c {
                    background-color:transparent!important;
                    box-shadow:none!important;
                    overflow: visible!important;
                }
                .gm-style .gm-style-iw {
                    display: contents!important;
                }
                .gm-ui-hover-effect {
                    opacity: 0!important;
                    display:none!important;
                }
                .custom-iw, .custom-iw>div:first-child>div:last-child {
                    width: calc(100vw - 40px) !important;
                }
                .gm-style div div div div {
                    max-width: calc(100vw - 40px) !important;
                }
                .gm-style .gm-style-iw-d {
                    height:0;
                }
                .gm-style .gm-style-iw-t::after, .gm-style-iw-t::before {
                    border:none;
                }
                #div-main-infoWindow {
                    overflow: visible !important;
                    width: calc(100vw - 40px)!important;
                }
                .boton_personalizado {
                    text-decoration: none!important;
                    max-height: 4rem!important;
                    padding: 0.8rem!important;
                    background-color: transparent!important;
                    border-radius: 6px!important;
                    width: 20%!important;
                    margin: 0 auto!important;
                    display:none!important;
                }
                .gm-style .box-card {
                    border-radius:6px!important;
                    margin: 0px!important;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)!important;
                    max-width: 100%!important;
                    width: 100%!important;
                    min-height: 70px!important;
                    display: flex!important;
                    position: absolute!important;
                    bottom: 30px!important;
                    left: -50%!important;
                }
                .content-ios .gm-style .box-card {

                }
                .gm-style .box-card .icon-container img{
                    width: 70px!important;
                    height:70px!important;
                    border-radius:6px!important;
                    display: flex!important;
                    justify-content: space-around!important;
                    align-items: center!important;
                }
                .gm-style .box-card .description {
                    display: flex!important;
                    justify-content: center!important;
                    align-items: flex-start!important;
                    flex-direction: column!important;
                    flex-grow: 1!important;
                    flex-basis: 0!important;
                    padding: 3px 20px 3px 5px!important;
                    color: #ffffff!important;
                    width:calc(100% - 70px)!important;
                }
                .gm-style .box-card .description .name {
                    font-weight: bold!important;
                    font-size: 1.7rem!important;
                    overflow: hidden!important;
                    max-width: 100%!important;
                    word-break: break-word;
                }
                .gm-style .box-card .description .infoGeneral {
                    font-size: 1.3rem!important;
                    font-weight: normal!important;
                    overflow: hidden!important;
                    text-overflow: ellipsis!important;
                    white-space: nowrap!important;
                    margin: 0!important;
                    max-width: 100%!important;
                }
                .punta {
                    width: 0!important;
                    height: 0!important;
                    margin-left:-15px!important;
                    border-style: solid!important;
                    border-width: 15px 15px 0 15px!important;
                    position: inherit!important;
                    bottom: -14px!important;
                    left: 50%;
                }
                ion-icon.gas {
                    position: absolute;
                    right: 0px;
                    top: 0px;
                    width: 20px;
                    font-size: 2.5em;
                    color: white;
                    font-weight: bold;
                    border-radius: 6px 6px 0 0;
                }

                #infoWindowButtonRoutes {
                    display: flex!important;
                }
            </style>

            <div class="box-card"  style="background-color: ${this.appLayer.color}">
                <div id="infoWindowButtonRoutes" >
                    <div class="icon-container">
                        <img src="${imagen}" style="background: white;">
                    </div>
                    <div class="description">
                        <div class="name">
                        ${info.nombre}
                        </div>
                        <span class="infoGeneral">${info.direccion}<span *ngIf="info.direccion && info.nombreMunicipio">
                        </span>${info.nombreMunicipio}</span>
                    </div>
                </div>
                <div class="punta" style="border-color: ${this.appLayer.color} transparent transparent transparent!important;"></div>
                <ion-icon id="closeInfoWindow" name="close" role="img"
                class="icon icon-ios ion-ios-close gas" aria-label="close"></ion-icon>
            </div>`
        ;

    if (MenuRutasPage.currentInfoWindow)
        MenuRutasPage.currentInfoWindow.close();

    MenuRutasPage.currentInfoWindow = new google.maps.InfoWindow({
        content: contentString
    });
    MenuRutasPage.currentInfoWindow.setPosition(latLng);
    MenuRutasPage.currentInfoWindow.open(MapProvider.map);

    MenuRutasPage.currentInfoWindow.addListener('domready', (args: any[]): void => {

        document.getElementById('closeInfoWindow')
            .addEventListener('click', () => {
                MenuRutasPage.currentInfoWindow.close();
            });
    });

    MapProvider.map.panTo(latLng);
} */

private setDetalles(d) {
    this.imgDetalle = d.imgDetalle;
    this.txtDetalle = d.txtDetalle;
    this.items = d.items;
}

checkMostrarRuta(event, ruta, index) {
    if (event.checked) {
        if (ruta.idPunto) {
            this.pintarMarkers(ruta);
            this.centrarMapa(ruta, 16);
        }
        ruta.checked = true;
        this.showPuntos = false;
    } else {
        ruta.checked = false;
    }
}

onPintarMarkerRutas(rutasCercanasReponse: any) {
    this.showMenu = true;
    GmapsMovilidadService.eliminarMarkersPolylines(this.markers);
}

private deleteAllMapMarkers() {
    this.markers.map(elm => {
        elm.setMap(null);
    });

    // eliminar puntos ciclo parqueaderos
    this.limpiarMarkers(this.markersEspacioPublico);
    this.limpiarMarkers(this.markersEstacionesSITVA);
    this.limpiarMarkers(this.markersEspaciosDeportivos);
    this.limpiarMarkers(this.markersEquipamientos);
    this.limpiarMarkers(this.markersParques);
}

mostrarRuta(event) {
    if (event.visible) {
        this.showDetalle = false;
    }
}

private pintarMarkerRutasCercanas(listaRutaCercanas: any) {
    if (listaRutaCercanas.idPunto) {
        this.pintarMarkers(listaRutaCercanas);
        return;
    }

    // for (let index = 0; index < listaRutaCercanas.length; index++) {
    for (const rutaCercana of listaRutaCercanas) {
        const dataMarker = {
            icono: GmapsMovilidadService.obtenerIconoMarker(
                rutaCercana
            ),
            mLat: rutaCercana.latitud,
            mLng: rutaCercana.longitud
        };

        const marker: any = GmapsMovilidadService.pintarMarker(dataMarker);
        marker.dataRutaCercana = rutaCercana;
        console.log('dataRutaCercana', JSON.stringify(marker.dataRutaCercana));
        // debugger;
        if (
            marker.dataRutaCercana.nombreModoEstacion ===
            ModoEstacion.ENCICLA
        ) {
            this.agregarDisponibildadEncicla(marker);
        } else {
            GmapsMovilidadService.agregarInfoParadero(marker);
        }
        if (
            marker.dataRutaCercana.codigoParadero ||
            marker.dataRutaCercana.codigoParadero
        ) {
            GmapsMovilidadService.agregarInfoParadero(marker);
        }
        this.markers.push(marker);
    }
}

pintarMarkers(data: any) {
    if (data.checked) {
        const dataMarker = {
            icono: GmapsMovilidadService.obtenerIconoMarker(data),
            mLat: data.latitud,
            mLng: data.longitud
        };
        const marker: any = GmapsMovilidadService.pintarMarker(dataMarker);
        marker.dataRutaCercana = data;
        console.log('dataRutaCercana', JSON.stringify(marker.dataRutaCercana));
        // debugger;
        if (
            marker.dataRutaCercana.nombreModoEstacion ===
            ModoEstacion.ENCICLA
        ) {
            this.agregarDisponibildadEncicla(marker);
        } else {
            GmapsMovilidadService.agregarInfoParadero(marker);
        }
        if (
            marker.dataRutaCercana.codigoParadero ||
            marker.dataRutaCercana.codigoParadero
        ) {
            GmapsMovilidadService.agregarInfoParadero(marker);
        }
        this.markersPuntoRecarga.push(marker);
    }
}

ocultarMarkers(): void {
    GmapsMovilidadService.eliminarMarkersPolylines(this.markersPuntoRecarga);
}

private agregarDisponibildadEncicla(marker: any) {
    google.maps.event.addListener(
        marker,
        'click',
        ((markerA, me) => {
            return () => {
                const data = new DisponibilidadEnciclaRequest(
                    'token',
                    markerA.dataRutaCercana.idEstacion,
                    'fecha'
                );
                this.utilidades.presentLoading();
                this.onObtenerDisponibilidadEncicla(data, marker);
            };
        })(marker, this)
    );
}

obtenerUbicacionActual() {
    const geoposition: Geoposition = this.locationChange.getGeoposition();
    this.ubicacion.latitud = geoposition.coords.latitude;
    this.ubicacion.longitud = geoposition.coords.longitude;
    this.ubicacion.descripcion = 'Mi Ubicación';

    if (this.ubicacion.latitud !== 0 && this.ubicacion.longitud !== 0) {
        this.updateCreatePositionMarker(this.ubicacion);
    }
}

clickUbicacionSeleccionada(lat, lng) {
    this.markers = [];
    const res = this.actionRadius / 1000;
    const modosTransportes = this.utilidades.obtenerModosTransportesActivos(
        this.preferenciasTransportes
    );
    this.rutasCercanasRequest = new RutasCercanasRequest(
        new Date().toISOString().substring(0, 10),
        lat,
        lng,
        modosTransportes,
        res
    );
    this.onObtenerRutasCercanas();
}

onObtenerRutasCercanas() {
    this.utilidades.presentLoading();
    this.wsMovilidad
        .obtenerRutasCercanas(this.rutasCercanasRequest)
        .subscribe(
            succces => {
                const data = succces as RutasCercanasReponse;
                this.extraeRespuestaRutasCercanas(data);
                this.utilidades.dismissLoading();
            },
            error => {
                this.utilidades.dismissLoading();
                console.log('Error', error);
                if (error.status === 404) {
                    this.messageProvider
                        .getByNombreIdentificador(
                            'no_existen_rutas_cercanas'
                        )
                        .subscribe((response: any) => {
                            const msg = response;
                            this.utilidades.basicAlert(
                                msg.titulo,
                                msg.descripcion
                            );
                        });
                } else {
                    this.messageProvider
                        .getByNombreIdentificador('inconveniente_movilidad')
                        .subscribe((response: any) => {
                            const msg = response.json();
                            this.utilidades.basicAlert(
                                msg.titulo,
                                msg.descripcion
                            );
                        });
                }
            }
        );
}

private extraeRespuestaRutasCercanas(data: RutasCercanasReponse) {
    if (
        data.estaciones.length > 0 ||
        data.paraderos.length > 0 ||
        data.ciclovias.length > 0
    ) {
        this.puntosRutas = data;
        this.onPintarMarkerRutas(data);
    } else {
        this.messageProvider
            .getByNombreIdentificador('no_existen_rutas_cercanas')
            .subscribe((response: any) => {
                const msg = response;
                this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                this.utilidades.dismissLoading();
            });
    }
}

onObtenerUbicacionesFavoritas(idUsuario: number) {
    this.wsMovilidad.obtenerUbicacionesFavoritas(idUsuario).subscribe(
        (succces: any) => {
            this.wsMovilidad.ubicacionesFavoritas = succces;
            this.ubicacionesFavoritas = succces;
        },
        error => {
            this.messageProvider
                .getByNombreIdentificador('inconveniente_movilidad')
                .subscribe((response: any) => {
                    const msg = response.json();
                    this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                });
        }
    );
}

establecerUbicacion({ descripcion, latitud, longitud }) {
    this.ubicacion.descripcion = descripcion;
    this.ubicacion.latitud = latitud;
    this.ubicacion.longitud = longitud;
    this.updateCreatePositionMarker(this.ubicacion);
}

private updateCreatePositionMarker(ubicacion: Ubicacion) {
    GmapsMovilidadService.eliminarMarkersPolylines(this.markers);

    // eliminar puntos ciclo parqueaderos
    this.limpiarMarkers(this.markersEspacioPublico);
    this.limpiarMarkers(this.markersEstacionesSITVA);
    this.limpiarMarkers(this.markersEspaciosDeportivos);
    this.limpiarMarkers(this.markersEquipamientos);
    this.limpiarMarkers(this.markersParques);

    this.markers = [];
    if (ubicacion !== undefined) {
        const { latitud, longitud } = ubicacion;
        this.showMenu = true;
        GmapsMovilidadService.createUpdatePositionMarker(latitud, longitud);
        GmapsMovilidadService.centrarMapa(latitud, longitud);
        this.searchBySelectedPreference(latitud, longitud);
    } else {
        this.showMenu = false;
    }
}

nuevaUbicacionFavorita() {
    const ubicacion = new Ubicacion();
    ubicacion.descripcion = '';
    ubicacion.modoBusqueda = MODOS_BUSQUEDA.PREDICCION_GOOGLE;
    ubicacion.txtPlaceholder = 'Nueva ubicación favorita';
    // this.ubicacionFavoritaPage = this.navCtrl.push(UbicacionFavoritaPage, {
    //     root: this.appLayer,
    //     isModal: false
    // });
    const navigateParamsUF: NavigationExtras = {
      queryParams: {
        root: this.appLayer,
        isModal: false
      }
    };
    this.route.navigate([`/ubicacion-favorita`], navigateParamsUF);
}

async mostrarOpcionesUbicacion(event, ubicacion) {
    const popCotrl = await this.popoverCtrl.create({
      component: MenuFavoritoPopoverComponent,
      componentProps: {
        ubicacion,
        rootNavCtrl: this.navCtrl,
        root: this.appLayer
      }
    });
    return popCotrl.present();
}

public clearValues() {
    if (this.showMenu) {
        this.ubicacion.descripcion = '';
    }
}

private searchBySelectedPreference(lat: number, lng: number) {
    const modosTransportes = this.preferenciasTransportes.map(elm => elm.id);
    this.markers = [];
    const res = this.actionRadius / 1000;
    this.rutasCercanasRequest = new RutasCercanasRequest(
        new Date().toISOString().substring(0, 10),
        lat,
        lng,
        modosTransportes.toString(),
        res
    );
    this.consultarRutasCercanas(() => {
        this.parseRutasCercanas();
        this.pintarPuntosCicloParqueaderos();
    });
}

private consultarRutasCercanas(callback: () => any ) {
    this.utilidades.presentLoading();
    this.wsMovilidad
        .obtenerRutasCercanas(this.rutasCercanasRequest)
        .subscribe(
            succces => {
                const data = succces as RutasCercanasReponse;
                this.puntosRutas = data;
                this.utilidades.dismissLoading();
                return callback();
            },
            error => {
                this.puntosRutas = null;
                this.utilidades.dismissLoading();
                if (error.status === 404) {
                    this.messageProvider
                        .getByNombreIdentificador(
                            'no_existen_rutas_cercanas'
                        )
                        .subscribe((response: any): void => {
                            const msg = response;
                            this.utilidades.basicAlert(
                                msg.titulo,
                                msg.descripcion
                            );
                        });
                } else {
                    this.messageProvider
                        .getByNombreIdentificador('inconveniente_movilidad')
                        .subscribe((response: any): void => {
                            const msg = response;
                            this.utilidades.confirmAlert(
                                msg.titulo,
                                msg.descripcion
                            );
                        });
                }
            }
        );
}

private parseRutasCercanas() {
    if (this.puntosRutas !== undefined) {
        const {
            estaciones,
            lineas,
            paraderos,
            puntosTarjetaCivica
        } = this.puntosRutas;

        if (this.rutasActive && paraderos.length > 0) {
            this.pintarMarkerRutasCercanas(paraderos);
        }

        if (this.lineasActive && lineas.length > 0) {
            const estacionesMetro = estaciones.filter(
                estacion =>
                    estacion.nombreModoEstacion === 'METRO' ||
                    estacion.nombreModoEstacion === 'TRANVIA' ||
                    estacion.nombreModoEstacion === 'METRO_PLUS' ||
                    estacion.nombreModoEstacion === 'METRO_CABLE'
            );
            this.pintarMarkerRutasCercanas(estacionesMetro);
        }

        if (this.cicloActive && estaciones.length > 0) {
            const estacionesEncicla = estaciones.filter(
                estacion => estacion.nombreModoEstacion === 'ENCICLA'
            );
            this.pintarMarkerRutasCercanas(estacionesEncicla);
        }

        if (this.puntosActive && puntosTarjetaCivica.length > 0) {
            this.pintarMarkerRutasCercanas(puntosTarjetaCivica);
            const id = document.getElementById('puntosCard');
        }
    }
}

private codificarDireccion(latlng: { lat; lng }) {
    GmapsMovilidadService.codificarDireccion(latlng, 'location').then(data => {
        if (this.ubicacion) {
            this.ubicacion.descripcion = data.descripcion;
        }
    });
}



}
