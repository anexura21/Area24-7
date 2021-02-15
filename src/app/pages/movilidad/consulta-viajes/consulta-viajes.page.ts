import { EstablecerUbicacionComponent } from './../../../components/establecer-ubicacion/establecer-ubicacion.component';
import { Municipality } from './../../../entities/municipality';
import { TerritorioService } from './../../../providers/territorio.service';
import { MapStyle } from './../../../shared/utilidades/map-style';
import { ModalController } from '@ionic/angular';
import { EstablecerUbicacionPage } from './../establecer-ubicacion/establecer-ubicacion.page';
import { LavergService } from './../../../providers/movilidad/laverg.service';
import { GmapsMovilidadService } from './../../../providers/movilidad/gmaps-movilidad.service';
import { LocationChangeService } from './../../../providers/location-change.service';
import { LocationUpdateService } from './../../../providers/location-update.service';
import { LayerService } from './../../../providers/layer.service';
import { PosiblesViajesService } from './../../../providers/posibles-viajes.service';
import { WsMovilidadService } from './../../../providers/movilidad/ws-movilidad.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppLayer } from '../../../entities/app-layer';
import { MODOS_BUSQUEDA, Ubicacion } from '../../../entities/movilidad/ubicacion.model';
import { Common } from '../../../shared/utilidades/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OtherLayer } from 'src/app/entities/other-layer';
import { TransportMode } from 'src/app/entities/transport-mode';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { OtherLayerComponent } from 'src/app/components/other-layer/other-layer.component';
import { VistaViajesPage } from '../vista-viajes/vista-viajes.page';

@Component({
  selector: 'app-consulta-viajes',
  templateUrl: './consulta-viajes.page.html',
  styleUrls: ['./consulta-viajes.page.scss']
})
export class ConsultaViajesPage implements OnInit, OnDestroy {

  private static map: google.maps.Map;
  cardFullViajesSugeridos: boolean;
  cardMinViajesSugeridos: boolean;
  componentFavorito: boolean;
  detalleViaje: boolean;
  destino: Ubicacion;
  modalOrigen: any;
  modalDestino: any;
  origen: Ubicacion;
  seleccionarMapaModal: boolean;
  ubicacion: Ubicacion;
  ubicacionModal: boolean;
  ubicacionFavoritaModal: boolean;
  origenDestinoFlag: boolean;
  origenDestinoIcono: string;
  preferenciasTransportes: any[];
  titulo: string;
  appId: number;
  apps: AppLayer[];
  private municipios: any;
  private geoposition: Geoposition;

  private locationUpdateSubscription: Subscription;
  private firstLocationCenterMap = false;
  private LOCATION_UPDATES_INTERVAL = 100;
  private DISTANCE_TOLERANCE = 0;
  public appLayer: AppLayer;
  private centerOfMap = new google.maps.LatLng(0, 0);
  private mapOptions: any = {};
  private centerAMVA: any = { lat: 6.273357, lng: -75.46679 };

  constructor(public common: Common,
              public wsMovilidad: WsMovilidadService,
              public posiblesViajesP: PosiblesViajesService,
              private layerProvider: LayerService,
              private territorioProvider: TerritorioService,
              private locationUpdate: LocationUpdateService,
              private locationChange: LocationChangeService,
              private router: ActivatedRoute,
              private lavergSvc: LavergService,
              private modalCtrl: ModalController,
              private route: Router) {
    this.origenDestinoIcono = 'assets/movilidad/iconos/cambiarIcon.png';
    this.origen = new Ubicacion();
    this.destino = new Ubicacion();

    this.origen.modoBusqueda = MODOS_BUSQUEDA.PREDICCION_GOOGLE;
    this.destino.modoBusqueda = MODOS_BUSQUEDA.PREDICCION_GOOGLE;

    this.origen.txtPlaceholder = 'Origen';
    this.destino.txtPlaceholder = 'Destino';


    // this.layerProvider.currentAppChange$.subscribe((app: AppLayer) => {
    //   this.appLayer = app;
    // });

    // this.appLayer = this.navParams.get('app');
    // this.appLayer = this.router.snapshot.paramMap.get('app');
    console.log('constructor');
    console.log('appLayer');
    // this.appLayer = this.lavergSvc.appLayer;
    // this.titulo = this.appLayer.children.find((layer: OtherLayer) => layer.layerType === 'MAPA DE VIAJES').name;
    this.router.queryParams.subscribe( params => {
        //   this.appLayer = JSON.parse(params['app']);
        //   this.appLayer.children = JSON.parse(params['children']);
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
    // this.router.params.subscribe(( data: AppLayer) => {
    //     console.log(data);
    //     this.appLayer = data;

    //     console.log(this.appLayer);
    //     console.log(this.appLayer.name);
    //     this.appLayer.name = this.appLayer._name;
    //     this.titulo = this.appLayer._name;
    //     console.log(this.appLayer.name);
    // });
    this.subscribePreferences();
  }

ngOnInit() {
  this.turnOnLocationUpdate();
  console.log('ngOnInit()');
//   this.titulo =
//   this.appLayer.children.find((layer: OtherLayer) => layer.layerType === 'MAPA DE VIAJES').name;
  this.territorioProvider.getAmvaMunicipalities().then(
    (municipalities: Municipality[]): void => {
        this.municipios = municipalities;
        this.loadMunicipalitiesToMap();
    },
    (error: any): void =>
        console.log(ConsultaViajesPage.name + ' ngOnInit getAmvaMunicipalities error ' + JSON.stringify(error))
  );
  this.geoposition = this.locationChange.getGeoposition();
  this.centerOfMap = new google.maps.LatLng(this.geoposition.coords.latitude, this.geoposition.coords.longitude);
  this.mapOptions = {
        zoom: 14,
        center: this.centerOfMap,
        disableDefaultUI: true,
        styles: MapStyle.estiloMapa,
        mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.setupMap();
}

setupMap(): void {
    ConsultaViajesPage.map = new google.maps.Map(
        document.getElementById('map-selection')
        , this.mapOptions);
}

loadMunicipalitiesToMap(): void {
    this.municipios.forEach(
        (municipality: Municipality): void => {
            const decoded = google.maps.geometry.encoding.decodePath(
                municipality.polygonLineStr
            );
            const paths = decoded.map(item => {
                return { lat: item.lat(), lng: item.lng() };
            });
            const polygon = new google.maps.Polygon({
                paths,
                map: ConsultaViajesPage.map,
                fillColor: '#D9EBB8',
                strokeColor: '#96C93D'
            });
        }
    );
}

subscribePreferences() {
  this.layerProvider.transportModesChange$.subscribe(
      (transportsPreferences: TransportMode[]) => {
          this.preferenciasTransportes = transportsPreferences;
      });
  console.log('subscribePreferences()');
}

ionViewWillLeave() {
    console.log('ionViewWillLeave()');
    GmapsMovilidadService.deletePositionMarker();
    this.common.dismissLoading();
}

ngOnDestroy() {
    OtherLayerComponent.layerTypeCurrentlyActive = undefined;
    if (this.locationUpdateSubscription) {this.locationUpdateSubscription.unsubscribe(); }

}

// mostrarModal(ubicacion: Ubicacion, type?: string) {
//     let navParams = {
//         ubicacion: ubicacion,
//         root: this.appLayer,
//         rootName: 1,
//     }

//     let navOptions = {
//         showBackdrop: false,
//         enableBackdropDismiss: false
//     };

//     let modal = this.common.createModal(EstablecerUbicacionPage, navParams, navOptions)
//     modal.onDidDismiss(data => {
//         if(data){
//             if(data.longitud !== undefined && data.longitud !== 0){
//                 if(type === 'origen'){
//                     this.origen = data
//                     GmapsMovilidad.createPositionMarker(this.origen)
//                     GmapsMovilidad.centrarMapa(this.origen.latitud, this.origen.longitud)


//                 }else if( type === 'destino'){
//                     this.destino = data

//                 }
//         }
//     }

//         if(this.origen.descripcion === undefined) this.origen.descripcion = ''
//         if(this.destino.descripcion === undefined) this.destino.descripcion = ''

//         this.actualizarVista()

//     })
//     GmapsMovilidad.deletePositionMarker()
//     modal.present()
// }

async mostralModal(ubicacion: Ubicacion, type?: string) {
    const modal = await this.modalCtrl.create({
      component: EstablecerUbicacionComponent,
      componentProps: {
        ubicacion,
        root: this.appLayer,
        rootName: 1
      },
      backdropDismiss: false
    });
    console.log('Modal');
    modal.onDidDismiss().then((data: any) => {
        if (data){
            if (data.longitud !== undefined && data.longitud !== 0){
                if (type === 'origen'){
                    this.origen = data;
                    GmapsMovilidadService.createPositionMarker(this.origen);
                    GmapsMovilidadService.centrarMapa(this.origen.latitud, this.origen.longitud);


                }else if( type === 'destino'){
                    this.destino = data;

                }
        }
    }

        if (this.origen.descripcion === undefined) {this.origen.descripcion = '' }
        if (this.destino.descripcion === undefined) {this.destino.descripcion = '' }

        this.actualizarVista();

    });
    return modal.present();
  }

actualizarVista() {
    const origenValido = this.validarUbicacion(this.origen);
    const destinoValido = this.validarUbicacion(this.destino);

    this.cardFullViajesSugeridos = origenValido && destinoValido;
    if (this.cardFullViajesSugeridos) {
        this.posiblesViajesP.cambiarPosiciones(this.origen, this.destino);

        this.posiblesViajesP.obtenerviajesSugeridos(true)
            .then(data => {
                GmapsMovilidadService.deletePositionMarker();
                const params = { data, app: this.appLayer };
                // this.app.getRootNav().push(VistaViajesPage, params);
                this.route.navigate(['/vista-viajes', params]);
            })
            .catch(error => {
                this.common.basicAlert('Movilidad', error);
            });
    }
    if (!this.cardFullViajesSugeridos) {
        this.cardMinViajesSugeridos = false;
    }
}

searchPositionBtn() {
    this.actualizarVista();
}

validarUbicacion(ubicacion) {
    if (ubicacion.descripcion) {
        return ubicacion.descripcion.length !== 0;
    }
    return false;
}

toogleViajesSugeridos() {
    //     this.cardMinViajesSugeridos = !this.cardMinViajesSugeridos;
}

cambiarOrigenDestino() {
    // debugger;
    if (this.origenDestinoFlag) {
        this.origenDestinoIcono = 'assets/movilidad/iconos/cambiarIcon.png';
        this.origenDestinoFlag = false;
    } else {
        this.origenDestinoIcono = 'assets/movilidad/iconos/cambiarIcon2.png';
        this.origenDestinoFlag = true;
    }


    if (this.origen.descripcion === undefined) {
        this.origen.descripcion = '';
    } else if (this.destino.descripcion === undefined) {
        this.destino.descripcion = '';
    }

    const aux = this.origen;
    this.origen = this.destino;
    this.destino = aux;
    this.actualizarVista();
}

obtenerUbicacionActual() {
    const geoposition: Geoposition = this.locationChange.getGeoposition();

    this.origen.latitud = geoposition.coords.latitude;
    this.origen.longitud = geoposition.coords.longitude;
    this.origen.descripcion = 'Mi Ubicación';

    GmapsMovilidadService.createPositionMarker(this.origen);
    GmapsMovilidadService.centrarMapaDetailViaje(this.origen.latitud, this.origen.longitud, 16);
}


updatePositionMaker(latLng: { lat: number, lng: number }): void {
    const pos: Ubicacion =  new Ubicacion();
    pos.longitud = latLng.lng;
    pos.latitud = latLng.lat;

    GmapsMovilidadService.createPositionMarker(pos);
    GmapsMovilidadService.centrarMapaDetailViaje(latLng.lat, latLng.lng, 16);
}

turnOnLocationUpdate() {
    if (this.locationUpdateSubscription) {return; }
    this.locationUpdateSubscription = this.locationUpdate.getObservable(this.DISTANCE_TOLERANCE, this.LOCATION_UPDATES_INTERVAL)
        .subscribe((latLng: { lat: number, lng: number }): void => {
            console.log(latLng);
            this.updatePositionMaker(latLng);
        });
}

}
