import { Common } from './../../shared/utilidades/common.service';
import { LocationUpdateService } from './../../providers/location-update.service';
import { LocationChangeService } from './../../providers/location-change.service';
import { MapService } from './../../providers/map.service';
import { LayerService } from './../../providers/layer.service';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppLayer } from '../../entities/app-layer';
import { LayerManagerComponent } from '../layer-manager/layer-manager.component';
import { MyLocationComponent } from '../my-location/my-location.component';
import { GeoLayerStaticComponent } from '../geo-layer-static/geo-layer-static.component';
import { FusionLayerComponent } from '../fusion-layer/fusion-layer.component';

@Component({
  selector: 'mi-entorno',
  templateUrl: './mi-entorno.component.html',
  styleUrls: ['./mi-entorno.component.scss'],
})
export class MiEntornoComponent implements OnInit, OnDestroy {

  static readonly LOCATION_UPDATES_INTERVAL: number = 5000;
  static readonly DISTANCE_TOLERANCE: number = 0;

  @Input()
  app: AppLayer;

  @ViewChild(MyLocationComponent)
  private myLocationComponent: MyLocationComponent;

  @ViewChild(LayerManagerComponent)
  private layerManagerComponent: LayerManagerComponent;

  private locationUpdateSubscription: Subscription;
  private firstLocationCenterMap = false;

  private timerId: any;
  private actionRadius: number;

  constructor(private layerProvider: LayerService,
              private locationUpdate: LocationUpdateService,
              private common: Common) { }

  ngOnInit() {
    console.log('MiEntornoComponent ngOnInit');
    // this.turnOnLocationUpdates();

    this.layerProvider.currentAppChange$.subscribe(
        (app: AppLayer) => {
          console.log(app);
          this.myLocationComponent.onActionRadiusChange(app.radius);
          FusionLayerComponent.emitActionRadiusChange(app.radius);
          GeoLayerStaticComponent.emitActionRadiusChange(app.radius);
        }
    );

    this.onClickMyLocationButton();
  }

  ngOnDestroy(): void {
    this.turnOffLocationUpdates();
  }

  async onClickMyLocationButton() {
      // let geoposition: Geoposition = this.locationChange.getGeoposition();
        const geoposition: { lat: number, lng: number, time: number } = await this.locationUpdate.getCurrentGeoposition();
        /*   let geoposition: Geoposition = this.locationChange.getGeoposition();*/
        this.myLocationComponent.createUpdatePositionMarker(geoposition.lat, geoposition.lng);
        FusionLayerComponent.emitLocationChange({
              lat: geoposition.lat
            , lng: geoposition.lng
        });
      /*  GeoLayerStaticComponent.emitLocationChange({
              lat: geoposition.coords.latitude
            , lng: geoposition.coords.longitude
        });*/
        MapService.map.panTo(
            new google.maps.LatLng(
                  geoposition.lat
                , geoposition.lng));
        this.turnOnLocationUpdates();
}

turnOnLocationUpdates(): void {
    if (this.locationUpdateSubscription && !this.locationUpdateSubscription.closed) {return; }

    this.locationUpdateSubscription = this.locationUpdate
        .getObservable(MiEntornoComponent.DISTANCE_TOLERANCE, MiEntornoComponent.LOCATION_UPDATES_INTERVAL)
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
    console.log(MiEntornoComponent.name + ' turnOnLocationUpdates ' + this.locationUpdateSubscription.closed);

  }

  turnOffLocationUpdates(): void {
    if (this.locationUpdateSubscription) {this.locationUpdateSubscription.unsubscribe(); }
    console.log(MiEntornoComponent.name + ' turnOffLocationUpdates ' + this.locationUpdateSubscription.closed);
  }

  onClickPedestrian(latLng: { lat: number, lng: number }): void {
  }

  onDragendPedestrian(latLng: { lat: number, lng: number }): void {
    this.turnOffLocationUpdates();
    FusionLayerComponent.emitLocationChange(latLng);
    // GeoLayerStaticComponent.emitLocationChange(latLng);
  }

}

