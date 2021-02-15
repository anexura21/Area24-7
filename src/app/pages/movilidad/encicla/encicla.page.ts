import { DisponibilidadEnciclaResponse } from './../../../entities/movilidad/disponibilidad-encicla-response';
import { DisponibilidadEnciclaRequest } from './../../../entities/movilidad/disponibilidad-encicla-request.model';
import { OtherLayerComponent } from 'src/app/components/other-layer/other-layer.component';
import { DetalleRutaComponent } from './../../../components/detalle-ruta/detalle-ruta.component';
import { MapaComponent } from './../../../components/mapa/mapa.component';
import { HorariosEnciclaModalComponent } from './../../../components/horarios-encicla-modal/horarios-encicla-modal.component';
import { timeout } from 'rxjs/operators';
import { GmapsMovilidadService } from './../../../providers/movilidad/gmaps-movilidad.service';
import { MapService } from './../../../providers/map.service';
import { GeoLayerStaticComponent } from './../../../components/geo-layer-static/geo-layer-static.component';
import { FusionLayerComponent } from './../../../components/fusion-layer/fusion-layer.component';
import { OtherLayer } from './../../../entities/other-layer';
import { ActivatedRoute } from '@angular/router';
import { LayerService } from './../../../providers/layer.service';
import { LocationUpdateService } from './../../../providers/location-update.service';
import { MessageService } from './../../../providers/message.service';
import { Common } from './../../../shared/utilidades/common.service';
import { WsMovilidadService } from './../../../providers/movilidad/ws-movilidad.service';
import { NavController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UbicacionFavorita } from './../../../entities/movilidad/ubicacion-favorita.model';
import { Ubicacion } from './../../../entities/movilidad/ubicacion.model';
import { AppLayer } from './../../../entities/app-layer';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-encicla',
  templateUrl: './encicla.page.html',
  // styleUrls: ['./encicla.page.scss'],
})
export class EnciclaPage implements OnInit, OnDestroy {

  static readonly LOCATION_UPDATES_INTERVAL: number = 5000;
  static readonly DISTANCE_TOLERANCE: number = 0;

  public appLayer: AppLayer;
  public titulo = '';

  public markerEvent: any;
  public markers = [];
  autocompleteItems: any[];
  acService: any;

  ubicacion: Ubicacion = new Ubicacion();
  ubicacionesFavoritas: UbicacionFavorita[];
  ubicacionFavoritaPage: any;

  polylines: any = [];

  private locationUpdateSubscription: Subscription;
  // @ViewChild(MyLocationComponent)
  // private myLocationComponent: MyLocationComponent;
  private firstLocationCenterMap = false;
  public draggedEvent: any;
  sessionStart = true;
  apps: any;
  appId: any;

  constructor(public navCtrl: NavController,
              public wsMovilidad: WsMovilidadService,
              private utilidades: Common,
              private messageProvider: MessageService,
              private locationUpdate: LocationUpdateService,
              private layerProvider: LayerService,
              private route: ActivatedRoute,
              private modalCtrl: ModalController) {
                // this.appLayer = this.navParams.get("app");
                // this.titulo = this.appLayer.children.find(
                //     (layer: OtherLayer) => layer.layerType === 'MAPA ENCICLA'
                // ).name;
                this.route.queryParams.subscribe(params => {
                  this.appLayer = new AppLayer(null);
                  console.log(params['nomApp']);
                  this.titulo = params['nomApp'];
                  this.appLayer.color = params['color'];
                  this.appId = Number(params['appId']);
                });
                this.layerProvider.getMenu().subscribe(data => {
                  this.apps = AppLayer.parseApps(Object.values(data));
                  this.appLayer = this.apps.find(app => app.id === this.appId);
                  console.log(this.appLayer);
                });
                this.ubicacion.txtPlaceholder = 'Ubicación';
                this.ubicacion.longitud = 0;
                this.ubicacion.latitud = 0;

                this.acService = new google.maps.places.AutocompleteService();

                this.utilidades.presentLoading();
                this.obtenerEstacionesEncicla();
    }

    ngOnInit() {
        this.subscribeServices();

        this.layerProvider.currentAppChange$.subscribe((app: AppLayer) => {
            // this.myLocationComponent.onActionRadiusChange(app.radius);
            FusionLayerComponent.emitActionRadiusChange(app.radius);
            GeoLayerStaticComponent.emitActionRadiusChange(app.radius);
        });

        this.onClickMyLocationButton();

        /* setTimeout(() => {
            this.obtenerUbicacionActual();
        }, 500); */
    }

    turnOnLocationUpdates(): void {
        if (
            this.locationUpdateSubscription &&
            !this.locationUpdateSubscription.closed
        ){
            return; }

        this.locationUpdateSubscription = this.locationUpdate
            .getObservable(
                EnciclaPage.DISTANCE_TOLERANCE,
                EnciclaPage.LOCATION_UPDATES_INTERVAL
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
                FusionLayerComponent.emitLocationChange({
                    lat: latLng.lat,
                    lng: latLng.lng
                });
            });
        console.log(
            EnciclaPage.name +
                ' turnOnLocationUpdates ' +
                this.locationUpdateSubscription.closed
        );
    }

    turnOffLocationUpdates(): void {
        if (this.locationUpdateSubscription){
            this.locationUpdateSubscription.unsubscribe(); }
    }

    async onClickMyLocationButton() {
        // let geoposition: Geoposition = this.locationChange.getGeoposition();

        const geoposition: {
            lat: number;
            lng: number;
            time: number;
        } = await this.locationUpdate.getCurrentGeoposition();

        /*        let geoposition: Geoposition = this.locationChange.getGeoposition();*/

        FusionLayerComponent.emitLocationChange({
            lat: geoposition.lat,
            lng: geoposition.lng
        });

        MapService.map.panTo(
            new google.maps.LatLng(geoposition.lat, geoposition.lng)
        );

        setTimeout(() => {
            this.ubicacion.latitud = geoposition.lat;
            this.ubicacion.longitud = geoposition.lng;
            this.ubicacion.descripcion = 'Mi Ubicación';

            this.updateCreatePositionMarker(this.ubicacion);
            this.turnOnLocationUpdates();
        }, 500);
    }


    // metodos de buscador
    public clearValues() {
        this.ubicacion.descripcion = '';
    }

    buscarDireccion(event: any) {
        if (event.keyCode === 13) {
            const item = { description: this.ubicacion.descripcion };
            this.seleccionarPrediccion(item);
        }
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
                        const msg = response;
                        this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                        this.utilidades.dismissLoading();
                    });
            });
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

    /* obtenerUbicacionActual() {
        let geoposition: Geoposition = this.locationChange.getGeoposition();
        this.ubicacion.latitud = geoposition.coords.latitude;
        this.ubicacion.longitud = geoposition.coords.longitude;
        this.ubicacion.descripcion = "Mi Ubicación";

        if (this.ubicacion.latitud != 0 && this.ubicacion.longitud != 0) {
            this.updateCreatePositionMarker(this.ubicacion);
        }
    } */

    private updateCreatePositionMarker(ubicacion: Ubicacion) {
        if (ubicacion !== undefined) {
            const { latitud, longitud } = ubicacion;
            GmapsMovilidadService.createUpdatePositionMarker(latitud, longitud);
            // GmapsMovilidad.centrarMapa(latitud, longitud);
            MapService.map.panTo(
                new google.maps.LatLng(latitud, longitud)
            );
        }
    }

    obtenerEstacionesEncicla() {
        this.wsMovilidad
            .obtenerInformacionEncicla()
            .pipe(timeout(10000))
            .subscribe(
                (data: any) => {
                    console.log('obtenerEstacionesEncicla', data);
                    this.onClickEncicla(data.estaciones);
                    this.pintarCicloRutas(data.ciclovias);
                    this.validarHorariosEncicla(data.horarios);
                },
                err => {
                    this.utilidades.dismissLoading();
                    this.utilidades.basicAlert(
                        'Movilidad',
                        'Ocurrió un inconveniente inténtelo nuevamente'
                    );
                }
            );
    }

    validarHorariosEncicla( horarios: any[] ){
        const currentDate = new Date();
        const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const day = weekdays[currentDate.getDay()];
        let hour = currentDate.getHours() + '';
        let minutes = currentDate.getMinutes() + '';

        if (minutes.length === 1){
            minutes = '0' + minutes;
        }

        if (hour.length === 1){
            hour = '0' + hour;
        }

        console.log('Day', day);
        console.log('Hour', hour);
        console.log('Minutes', minutes);

        if (day === 'monday' || day === 'tuesday' || day === 'wednesday' || day === 'thursday' || day === 'friday'){
            const horaInicio = horarios[0].horaInicio;
            const horaFin = horarios[0].horaFin;
            const horaActual = hour + ':' + minutes;

            console.log('Comparar horas semana', horaActual, horaInicio, horaFin);

            if (!(horaActual >= horaInicio && horaActual <= horaFin)){
                this.mostrarModalhorariosEncicla( horarios[0] );
            }

        } else if (day === 'saturday'){
            const horaInicio = horarios[0].horaInicioSabado;
            const horaFin = horarios[0].horaFinSabado;
            const horaActual = hour + ':' + minutes;

            console.log('Comparar horas sabado', horaActual, horaInicio, horaFin);

            if (!(horaActual >= horaInicio && horaActual <= horaFin)){
                this.mostrarModalhorariosEncicla( horarios[0] );
            }

        } else {
            this.mostrarModalhorariosEncicla( horarios[0] );
        }
    }


    async mostrarModalhorariosEncicla( horario ){
        console.log('Cargar Modal Horarios');
        const modalDetail = await this.modalCtrl.create({
          component: HorariosEnciclaModalComponent,
          componentProps: { horario, app: this.appLayer },
          cssClass: 'cargaModalHorario'
        });
        modalDetail.onDidDismiss().then(() => {
            console.log('modal horarios dismiss');
        });
        setTimeout( () => {
            modalDetail.present();
        }, 1000);
    }


    pintarCicloRutas( ciclovias: any[] ){
        // for(let i = 0; i < ciclovias.length; i++){
        for (const ciclovia of ciclovias){
            GmapsMovilidadService.mostrarRuta(ciclovia, 'ENCICLA');
        }
    }

  subscribeServices(): void {
    this.markerEvent = GmapsMovilidadService.markerClick$.subscribe(
        (data: any) => {
            this.showDetailModal(data);
        }
    );

    const layer = this.appLayer.children.find(
        (layerA: OtherLayer) => layerA.layerType === 'MAPA ENCICLA'
    );

    this.draggedEvent = MapaComponent.dragedPedestrian$.subscribe(
        ({ lat, lng }) => {
            if (lat !== 0 && lng !== 0 && !this.sessionStart) {
                this.ubicacion.latitud = lat;
                this.ubicacion.longitud = lng;
                this.codificarDireccion({ lat, lng });
                this.updateCreatePositionMarker(this.ubicacion);
            } else {
                this.sessionStart = !this.sessionStart;
            }
        }
    );
  }

  private codificarDireccion(latlng: { lat; lng }) {
      GmapsMovilidadService.codificarDireccion(latlng, 'location').then(data => {
          if (this.ubicacion) {
              this.ubicacion.descripcion = data.descripcion;
          }
      });
  }

    establecerUbicacion({ descripcion, latitud, longitud }) {
        this.ubicacion.descripcion = descripcion;
        this.ubicacion.latitud = latitud;
        this.ubicacion.longitud = longitud;
        this.updateCreatePositionMarker(this.ubicacion);
    }

    async showDetailModal(data: any) {
        const modalDetail = await this.modalCtrl.create({
          component: DetalleRutaComponent,
          componentProps: { data, app: this.appLayer, lat: 0, lng: 0 }
        });
        modalDetail.present();
    }

    ngOnDestroy() {

        if (this.draggedEvent) {this.draggedEvent.unsubscribe(); }

        if (this.markerEvent){ this.markerEvent.unsubscribe(); }
        OtherLayerComponent.layerTypeCurrentlyActive = undefined;

        // encicla
        this.deleteAllMapMarkers();
        GmapsMovilidadService.eliminarMarkersPolylines( GmapsMovilidadService.markersPolylines );
        this.markers = [];

        this.turnOffLocationUpdates();
    }

    private deleteAllMapMarkers() {
        this.markers.map(elm => {
            elm.setMap(null);
        });
    }

    // inicio pintar puntos encicla
    onClickEncicla(puntosRutas: any) {
        let estacionesEncicla: any[];
        if (puntosRutas != null) {
            estacionesEncicla = puntosRutas.filter(
                estacion => estacion.nombreModoEstacion === 'ENCICLA'
            );
        }
        if (estacionesEncicla != null && estacionesEncicla.length > 0){
            this.pintarMarkersByFiltro(estacionesEncicla); }

        this.utilidades.dismissLoading();
    }

    pintarMarkersByFiltro(estacionesEncicla: any[]) {
        GmapsMovilidadService.eliminarMarkersPolylines(this.markers);
        this.markers = [];
        this.pintarMarkerRutasCercanas(estacionesEncicla);
    }

    private pintarMarkerRutasCercanas(estacionesEncicla: any[]) {
        // for (var index = 0; index < estacionesEncicla.length; index++) {
        for ( const estacionEncicla of estacionesEncicla ){
            const dataMarker = {
                icono: GmapsMovilidadService.obtenerIconoMarker(
                    estacionEncicla
                ),
                mLat: estacionEncicla.latitud,
                mLng: estacionEncicla.longitud
            };

            const marker: any = GmapsMovilidadService.pintarMarker(dataMarker);
            marker.dataRutaCercana = estacionEncicla;
            console.log(
                'dataEstacionEncicla',
                JSON.stringify(marker.dataRutaCercana)
            );

            this.agregarDisponibildadEncicla(marker);
            this.markers.push(marker);
        }
    }

    private agregarDisponibildadEncicla(marker: any) {
        google.maps.event.addListener(
            marker,
            'click',
            ((markerA, me) => {
                return () => {
                    const data = new DisponibilidadEnciclaRequest(
                        'token',
                        marker.dataRutaCercana.idEstacion,
                        'fecha'
                    );
                    this.utilidades.presentLoading();
                    this.onObtenerDisponibilidadEncicla(data, markerA);
                };
            })(marker, this)
        );
    }

    onObtenerDisponibilidadEncicla(
        data: DisponibilidadEnciclaRequest,
        marker: any
    ) {
        this.wsMovilidad.obtenerDisponibilidadEncicla(data).subscribe(
            succces => {
                this.utilidades.dismissLoading();
                const dataA = succces as DisponibilidadEnciclaResponse;

                marker.dataRutaCercana.cantidadPuestosDisponibles =
                    dataA.cantidadPuestosDisponibles;
                marker.dataRutaCercana.cantidadBicicletasDisponibles =
                    dataA.cantidadBicicletasDisponibles;
                const infoWindow = GmapsMovilidadService.crearInfoWindow(
                    marker.dataRutaCercana,
                    marker
                );
            },
            error => {
                this.messageProvider
                    .getByNombreIdentificador('inconveniente_movilidad')
                    .subscribe((response: any): void => {
                        const msg = response;
                        this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                        this.utilidades.dismissLoading();
                    });
            }
        );
    }
    // fin pintar puntos encicla

}
