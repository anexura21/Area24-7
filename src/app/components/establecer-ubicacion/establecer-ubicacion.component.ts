import { Router } from '@angular/router';
import { MenuFavoritoPopoverComponent } from './../menu-favorito-popover/menu-favorito-popover.component';
import { SeleccionarMapaComponent } from './../seleccionar-mapa/seleccionar-mapa.component';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { LocationChangeService } from './../../providers/location-change.service';
import { LocationUpdateService } from './../../providers/location-update.service';
import { MessageService } from './../../providers/message.service';
import { WsMovilidadService } from './../../providers/movilidad/ws-movilidad.service';
import { Common } from './../../shared/utilidades/common.service';
import { FavoritosService } from './../../providers/movilidad/favoritos.service';
import { Subscription } from 'rxjs';
import { NavController, PopoverController, ModalController } from '@ionic/angular';
import { UbicacionFavorita } from './../../entities/movilidad/ubicacion-favorita.model';
import { BuscarUbicacionComponent } from './../buscar-ubicacion/buscar-ubicacion.component';
import { MODOS_BUSQUEDA, Ubicacion } from './../../entities/movilidad/ubicacion.model';
import { Component, Input, OnInit, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-establecer-ubicacion',
  templateUrl: './establecer-ubicacion.component.html',
  styleUrls: ['./establecer-ubicacion.component.scss'],
})
export class EstablecerUbicacionComponent implements OnInit, OnDestroy {

  @Input() ubicacion?: Ubicacion;
  @ViewChild(BuscarUbicacionComponent) buscarUbicacionComponent: BuscarUbicacionComponent;
  animate: any;
  root: any;
  clickUbicacionSeleccionada?: any;
  tipo;

  @Output() clickNuevaUbicacionFavorita ? = new EventEmitter();
  @Output() clickSeleccionarEnMapa ?= new EventEmitter();
  @Output() clickUbicacionFavoritaSeleccionada ?= new EventEmitter();

  map: any;
  listenerMarker: any;
  ubicacionesFavoritas: UbicacionFavorita[];
  ubicacionFavoritaPage: any;
  titulo = `Seleccionar Ubicación`;
  rootName: number;
  app: any;

  private LOCATION_UPDATES_INTERVAL = 5000;
  private DISTANCE_TOLERANCE = 0;

  Ctrl: NavController;
  locationUpdateSubscription: Subscription;

  constructor(public popoverCtrl: PopoverController,
              public favoritosProvider: FavoritosService,
              private utilidades: Common,
              public wsMovilidad: WsMovilidadService,
              private messageProvider: MessageService,
              private locationUpdate: LocationUpdateService,
              private locationChange: LocationChangeService,
              private modalCtrl: ModalController,
              private navCtrl: NavController,
              private router: Router){
                this.animate = false;
                this.ubicacionesFavoritas = [];
                this.turnOnLocationUpdate();
               }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.locationUpdateSubscription) {this.locationUpdateSubscription.unsubscribe(); }
  }

  ionViewDidEnter() {
    const idUsuario = this.utilidades.obtenerUsuarioActivo().id;
    this.onObtenerUbicacionesFavoritas(idUsuario);
  }

  ionViewDidLeave(){
   this.utilidades.dismissLoading();
  }

  clickSeleccionarPrediccion(event) {
    this.utilidades.dismissModal(this.ubicacion);
  }

  establecerUbicacion({descripcion, latitud, longitud}) {
    this.ubicacion.descripcion = descripcion;
    this.ubicacion.latitud = latitud;
    this.ubicacion.longitud = longitud;
    this.utilidades.dismissModal(this.ubicacion);
  }

  async clickSeleccionarUbicacionMapa(event) {
    const params = {
      ubicacion: this.ubicacion,
      root: this.root,
      animate: false
    };

    const options = {
      showBackdrop: false,
      enableBackdropDismiss: false
    };

    const seleccionarMapaModal = await this.modalCtrl.create(
      {
        component: SeleccionarMapaComponent,
        componentProps: params,
        backdropDismiss: false
      });
      // SeleccionarMapaPage,params, options)

    seleccionarMapaModal.onWillDismiss().then((result: any) => {

      if (result){
        const {descripcion, longitud, latitud } = result;
        this.ubicacion.longitud = longitud;
        this.ubicacion.latitud = latitud;
        this.ubicacion.descripcion = descripcion;
        console.log(this.ubicacion);
      }

      // this.viewCtrl.dismiss(this.ubicacion)
      this.modalCtrl.dismiss(this.ubicacion);
    });

    seleccionarMapaModal.present();
  }


  nuevaUbicacionFavorita() {
    const ubicacion = new Ubicacion();
    ubicacion.descripcion = '';
    ubicacion.modoBusqueda = MODOS_BUSQUEDA.PREDICCION_GOOGLE;
    ubicacion.txtPlaceholder = 'Nueva ubicación favorita';
    // this.ubicacionFavoritaPage = this.navCtrl.push(UbicacionFavoritaPage, {'root': this.root, 'isModal':false});
    this.router.navigate(['/ubicacion-favorita', {root: this.root, ubicacion}]);
  }

  async mostrarOpcionesUbicacion(event, ubicacion) {
    const popCotrl = await this.popoverCtrl.create({
      component: MenuFavoritoPopoverComponent,
      componentProps: {
      ubicacion,
      rootNavCtrl: this.navCtrl,
      root: this.root
    }});
    return popCotrl.present();
  }

  onObtenerUbicacionesFavoritas(idUsuario: number) {
    this.wsMovilidad.obtenerUbicacionesFavoritas(idUsuario)
          .subscribe(
          (succces: any) => {
            this.wsMovilidad.ubicacionesFavoritas = succces;
            this.ubicacionesFavoritas = this.wsMovilidad.ubicacionesFavoritas;
          },
          error => {
            this.messageProvider.getByNombreIdentificador('inconveniente_movilidad').subscribe(
                (response: any): void => {
                    const msg = response;
                    this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                }
            );
          });
  }

  public obtenerUbicacionActual() {
    const geoposition: Geoposition = this.locationChange.getGeoposition();
    this.ubicacion.latitud = geoposition.coords.latitude;
    this.ubicacion.longitud = geoposition.coords.longitude;
    this.ubicacion.descripcion = 'Mi Ubicación';
    this.utilidades.dismissModal(this.ubicacion);
 }



 turnOnLocationUpdate(){
  if (this.locationUpdateSubscription) {return; }

  this.locationUpdateSubscription = this.locationUpdate
  .getObservable(this.DISTANCE_TOLERANCE, this.LOCATION_UPDATES_INTERVAL)
  .subscribe((latLng: { lat: number, lng: number }): void => {
        this.ubicacion.latitud = latLng.lat;
        this.ubicacion.longitud = latLng.lng;
  });
}

}
