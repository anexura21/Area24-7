import { MapService } from './../../providers/map.service';
import { LocationUpdateService } from './../../providers/location-update.service';
import { LayerService } from './../../providers/layer.service';
import { LocationChangeService } from './../../providers/location-change.service';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppLayer } from '../../entities/app-layer';
import { NavController } from '@ionic/angular';
import { Common } from '../../shared/utilidades/common.service';
import { FusionLayerComponent } from '../fusion-layer/fusion-layer.component';
import { GeoLayerStaticComponent } from '../geo-layer-static/geo-layer-static.component';
import { GeoLayer } from '../../entities/geo-layer';
import { MyLocationComponent } from '../my-location/my-location.component';
import { Subscription } from 'rxjs';
import { GeoLayerComponent } from '../geo-layer/geo-layer.component';
import { GeoLayerDynamicComponent } from '../geo-layer-dynamic/geo-layer-dynamic.component';

@Component({
  selector: 'vigia',
  templateUrl: './vigia.component.html',
  styleUrls: ['./vigia.component.scss'],
})
export class VigiaComponent implements OnInit, OnDestroy {

  static readonly LOCATION_UPDATES_INTERVAL: number = 60000;
  static readonly DISTANCE_TOLERANCE: number = 0;


  @Input()
  private app: AppLayer;

  @ViewChild(MyLocationComponent)
  private myLocationComponent: MyLocationComponent;

  @ViewChild(FusionLayerComponent)
  private fusionLayerSearchComponent: FusionLayerComponent;
  private locationUpdateSubscription: Subscription;
  private firstLocationCenterMap = false;

  private timerId: any;
  private actionRadius: number;
  private showingSearchView = false;
  private pedestrianLocation: { lat: number, lng: number };
  private searchResult: string;
  private layerSearch: GeoLayer = new GeoLayer({
      id: -1,
      nombre: '',
      activo: true,
      favorito: true,
      nombreTipoCapa: 'BUSQUEDA'
    });

  constructor(private common: Common,
              private locationChange: LocationChangeService,
              public navCtrl: NavController,
              private layerProvider: LayerService,
              private locationUpdate: LocationUpdateService
    ) {}

  ngOnInit(): void {
    this.layerProvider.currentAppChange$.subscribe(
        (app: AppLayer) => {
            this.myLocationComponent.onActionRadiusChange(app.radius);
            FusionLayerComponent.emitActionRadiusChange(app.radius);
            GeoLayerStaticComponent.emitActionRadiusChange(app.radius);
        }
    )
        this.onClickMyLocationButton();
  }

  ngOnDestroy(): void {
    this.turnOffLocationUpdates();
  }

  turnOnLocationUpdates(): void {
    if (this.locationUpdateSubscription && !this.locationUpdateSubscription.closed) {return; }

    this.locationUpdateSubscription = this.locationUpdate
        .getObservable(VigiaComponent.DISTANCE_TOLERANCE, VigiaComponent.LOCATION_UPDATES_INTERVAL)
        .subscribe(
            (latLng: { lat: number, lng: number }): void => {
                console.log('new location update ' + JSON.stringify(latLng));
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
    console.log(VigiaComponent.name + ' turnOnLocationUpdates ' + this.locationUpdateSubscription.closed);
  }

  turnOffLocationUpdates(): void {
      if (this.locationUpdateSubscription) {this.locationUpdateSubscription.unsubscribe(); }
      console.log(VigiaComponent.name + ' turnOffLocationUpdates ' + this.locationUpdateSubscription.closed);
  }

  async onClickMyLocationButton() {
    const geoposition: { lat: number, lng: number, time: number } = await this.locationUpdate.getCurrentGeoposition();
    this.myLocationComponent.createUpdatePositionMarker(geoposition.lat, geoposition.lng);
    FusionLayerComponent.emitLocationChange({
          lat: geoposition.lat
        , lng: geoposition.lng
    });
    MapService.map.panTo(
        new google.maps.LatLng(
              geoposition.lat
            , geoposition.lng));
    this.turnOnLocationUpdates();
  }

onDragendPedestrian(latLng: { lat: number, lng: number }): void {
  this.turnOffLocationUpdates();
  FusionLayerComponent.emitLocationChange(latLng);
  GeoLayerComponent.emitLocationChange(latLng);
  GeoLayerDynamicComponent.emitLocationChange(latLng);
}

onShowSearchView(): void {
  this.turnOffLocationUpdates();
  // let modal: Modal = this.common.createModal(BusquedaAvistamientosComponent);
  const modal: any = this.common.createModal(null);
  modal.onDidDismiss((data: any, role: string): void => {
      if (data) {
          if (data.name) {
              FusionLayerComponent.emitAdditionalParamsChange(data.name);
              this.layerSearch.visible = true;
              this.fusionLayerSearchComponent.loadIntoMap();
          }
          else {this.onSearchByMunicipalityCentroid({ lat: data.lat, lng: data.lng }); }
      }
  });
  modal.present();
}

onSearchByMunicipalityCentroid(latLng: { lat: number, lng: number }): void {
  this.myLocationComponent.createUpdatePositionMarker(latLng.lat, latLng.lng);
  MapService.map.panTo(new google.maps.LatLng(latLng.lat, latLng.lng));
  FusionLayerComponent.emitLocationChange(latLng);
  GeoLayerDynamicComponent.emitLocationChange(latLng);
}

getNumberMaxValue(): number {
  return Number.MAX_VALUE;
}

}
