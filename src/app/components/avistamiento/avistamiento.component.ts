import { LocationChangeService } from './../../providers/location-change.service';
import { LayerService } from './../../providers/layer.service';
import { LocationUpdateService } from './../../providers/location-update.service';
import { MapService } from './../../providers/map.service';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GeoLayerDynamicComponent } from '../geo-layer-dynamic/geo-layer-dynamic.component';
import { InicioPage } from '../../pages/inicio/inicio.page';
import { FusionLayerComponent } from '../fusion-layer/fusion-layer.component';
import { GeoLayerComponent } from '../geo-layer/geo-layer.component';
import { AppLayer } from '../../entities/app-layer';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { Common } from '../../shared/utilidades/common.service';
import { GeoLayer } from '../../entities/geo-layer';
import { Subscription } from 'rxjs';
import { MyLocationComponent } from '../my-location/my-location.component';

@Component({
  selector: 'avistamiento',
  templateUrl: './avistamiento.component.html',
  styleUrls: ['./avistamiento.component.scss'],
})
export class AvistamientoComponent implements OnInit, OnDestroy {

  static readonly LOCATION_UPDATES_INTERVAL: number = 5000;
  static readonly DISTANCE_TOLERANCE: number = 10;

  @Input()
  private app: AppLayer;

  @ViewChild(MyLocationComponent)
  private myLocationComponent: MyLocationComponent;

  @ViewChild(FusionLayerComponent)
  private fusionLayerSearchComponent: FusionLayerComponent;

  private locationUpdateSubscription: Subscription;
  private firstLocationCenterMap = false;

  private layerSearch: GeoLayer = new GeoLayer({
      id: -1,
      nombre: '',
      activo: true,
      favorito: true,
      nombreTipoCapa: 'BUSQUEDA'
  });

  constructor(
      private common: Common,
      private locationChange: LocationChangeService,
      public navCtrl: NavController,
      private modalCtrl: ModalController,
      private alertCtrl: AlertController,
      private layerProvider: LayerService,
     // private ionicApp: IonicApp,
      private locationUpdate: LocationUpdateService
  ) {}

  ngOnInit(): void {
      console.log('AvistamientoComponent ngOnInit');

      this.layerProvider.currentAppChange$.subscribe(
          (app: AppLayer) => {
              this.myLocationComponent.onActionRadiusChange(app.radius);
              FusionLayerComponent.emitActionRadiusChange(app.radius);
              GeoLayerComponent.emitActionRadiusChange(app.radius);
              GeoLayerDynamicComponent.emitActionRadiusChange(app.radius);
          }
      );
      this.onClickMyLocationButton();
  }

  ngOnDestroy(): void {
      this.turnOffLocationUpdates();
      console.log('ngOnDestroy');
      // const activeView =  this.ionicApp._getActivePortal();
      // const activePortal = this.ionicApp._loadingPortal.getActive() ||
      // this.ionicApp._modalPortal.getActive() ||
      // this.ionicApp._toastPortal.getActive() ||
      // this.ionicApp._overlayPortal.getActive();
      // if (activePortal) {
      //   activePortal.dismiss();
      //   const activeViewClose = activeView.getActive();
      //   activeViewClose.dismiss();
      // }
  }

  turnOnLocationUpdates(): void {
      if (this.locationUpdateSubscription && !this.locationUpdateSubscription.closed) {return; }

      this.locationUpdateSubscription = this.locationUpdate
          .getObservable(AvistamientoComponent.DISTANCE_TOLERANCE, AvistamientoComponent.LOCATION_UPDATES_INTERVAL)
          .subscribe(
              (latLng: { lat: number, lng: number }): void => {
                  // alert('new Location update ' + JSON.stringify(latLng));
                 // alert('firstLocationCenterMap ' + this.firstLocationCenterMap);
                  if (!this.firstLocationCenterMap) {
                      this.firstLocationCenterMap = true;
                      const latLng_: google.maps.LatLng = new google.maps.LatLng(latLng.lat, latLng.lng);
                      MapService.map.setCenter(latLng_);
                  }
                  this.myLocationComponent.createUpdatePositionMarker(latLng.lat, latLng.lng);
                  FusionLayerComponent.emitLocationChange({
                        lat: latLng.lat
                      , lng: latLng.lng
                  });
              }
          );
  }
  turnOffLocationUpdates(): void {
      if (this.locationUpdateSubscription) {this.locationUpdateSubscription.unsubscribe(); }
      console.log(AvistamientoComponent.name + ' turnOffLocationUpdates ' + this.locationUpdateSubscription.closed);
  }

  async onClickMyLocationButton() {
      const geoposition: { lat: number, lng: number, time: number } = await this.locationUpdate.getCurrentGeoposition();
      console.log('Mi posicion', JSON.stringify(geoposition));

      this.myLocationComponent.createUpdatePositionMarker(
          geoposition.lat,
          geoposition.lng
      );
      FusionLayerComponent.emitLocationChange({
          lat: geoposition.lat,
          lng: geoposition.lng
      });
      MapService.map.panTo(
          new google.maps.LatLng(
              geoposition.lat,
              geoposition.lng
          )
      );
      this.turnOnLocationUpdates();
  }

  onClickPedestrian(latLng: { lat: number; lng: number }): void {
  }

  onDragendPedestrian(latLng: { lat: number; lng: number }): void {
      console.log('Move marker')
      this.turnOffLocationUpdates();
      FusionLayerComponent.emitLocationChange(latLng);
      GeoLayerComponent.emitLocationChange(latLng);
      GeoLayerDynamicComponent.emitLocationChange(latLng);
  }

  // TODO: try to bind layer.visible to markers visible property
  onShowSearchView(): void {
      this.turnOffLocationUpdates();
    //   const shearchView = this.alertCtrl.create({
    //       title: 'Consultar avistamientos',
    //       cssClass: 'alertAv',
    //       message: 'Seleccione el método para realizar la búsqueda',
    //       buttons: [
    //           {
    //               text: 'Por nombre',
    //               handler: () => {
    //                   this.searchByName();
    //               }
    //           },
    //           {
    //               text: 'Por municipio',
    //               handler: () => {
    //                   this.searchByMunicipality();
    //               }
    //           },
    //           {
    //               text: '',
    //               cssClass: 'closeBt close',
    //               handler: (): void => {
    //                   // if (this.navCtrl.canGoBack())
    //                   // this.navCtrl.pop();
    //               }
    //           }
    //       ]
    //   });
    //   shearchView.present();

  }

  searchByName(){
      console.log('Busqueda por nombre');
    //   const byName = this.alertCtrl.create({
    //       title: 'Búsqueda por nombre',
    //       cssClass: 'alertAv',
    //       inputs: [
    //           {
    //               name: 'name',
    //               placeholder: 'Nombre'
    //           }
    //       ],
    //       buttons: [
    //           {
    //               cssClass: 'alertAvR',
    //               text: 'Cancelar',
    //               role: 'cancel'
    //           },
    //           {
    //               text: 'Buscar',
    //               handler: (data) => {
    //                   console.log('Buscar por nombre: ', data.name);
    //                   FusionLayerComponent.emitDeleteMarkersByLayerType('BUSQUEDA');
    //                   FusionLayerComponent.emitAdditionalParamsChange(data.name);
    //                   this.layerSearch.visible = true;
    //                   this.fusionLayerSearchComponent.loadIntoMap();

    //               }
    //           },
    //           {
    //               text: '',
    //               cssClass: 'closeBt',
    //               handler: (): void => {
    //                   // if (this.navCtrl.canGoBack())
    //                   // this.navCtrl.pop();
    //               }
    //           }
    //       ]
    //   });
    //   byName.present();
  }

  searchByMunicipality(){
      console.log('Busqueda por municipio');
      const municipalities = InicioPage.municipalities;
    //   const byMunicipality = this.alertCtrl.create({
    //       title: 'Búsqueda por municipio',
    //       cssClass: 'alertAv',
    //       buttons: [
    //           {
    //               cssClass: 'alertAvR',
    //               text: 'Cancelar',
    //               role: 'cancel'
    //           },
    //           {
    //               text: 'Buscar',
    //               handler: (data) => {
    //                   console.log('Buscar por municipio: ', data, JSON.parse(data));
    //                   this.onSearchByMunicipalityCentroid({ lat: JSON.parse(data).lat, lng: JSON.parse(data).lng });

    //               }
    //           },
    //           {
    //               text: '',
    //               cssClass: 'closeBt',
    //               handler: (): void => {
    //                   // if (this.navCtrl.canGoBack())
    //                   // this.navCtrl.pop();
    //               }
    //           }
    //       ],
    //   });

    //   municipalities.forEach(municipality => {
    //       byMunicipality.addInput({
    //           type: 'radio',
    //           label: municipality.name,
    //           value: `{"lat": ${municipality.centroidLat}, "lng": ${municipality.centroidLng}}`
    //       });
    //   });

    //   byMunicipality.present();
  }

  onHideSearchView(turnOnLocationUpdates: boolean): void {}

  // TODO: verify if needed emitLocationChange to static and dynamic layers
  onSearchByMunicipalityCentroid(latLng: { lat: number; lng: number }): void {
      this.myLocationComponent.createUpdatePositionMarker(
          latLng.lat,
          latLng.lng
      );
      MapService.map.panTo(
          new google.maps.LatLng(latLng.lat, latLng.lng)
      );
      FusionLayerComponent.emitLocationChange(latLng);
      GeoLayerDynamicComponent.emitLocationChange(latLng);
  }

  getNumberMaxValue(): number {
      return Number.MAX_VALUE;
  }

}
