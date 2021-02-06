import { MapService } from './../../providers/map.service';
import { LayerService } from './../../providers/layer.service';
import { LocationUpdateService } from './../../providers/location-update.service';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppLayer } from '../../entities/app-layer';
import { LayerManagerComponent } from '../layer-manager/layer-manager.component';
import { MyLocationComponent } from '../my-location/my-location.component';
import { FusionLayerComponent } from '../fusion-layer/fusion-layer.component';

@Component({
  selector: 'movilidad',
  templateUrl: './movilidad.component.html',
  styleUrls: ['./movilidad.component.scss'],
})
export class MovilidadComponent implements OnInit, OnDestroy {

  static readonly LOCATION_UPDATES_INTERVAL: number = 5000;
  static readonly DISTANCE_TOLERANCE: number = 0;

  @Input()
  private app: AppLayer;

  @ViewChild(MyLocationComponent)
  private myLocationComponent: MyLocationComponent;

  @ViewChild(LayerManagerComponent)
  private layerManagerComponent: LayerManagerComponent;

  private locationUpdateSubscription: Subscription;
  private firstLocationCenterMap = false;

  constructor(
        private locationUpdate: LocationUpdateService,
        private layerProvider: LayerService
  ) { }

  ngOnInit() {
    console.log('MovilidadComponent ngOnInit');
    this.turnOnLocationUpdates();

    this.layerProvider.currentAppChange$.subscribe((app: AppLayer) => {
        console.log('AppLayer', app);
        // this.myLocationComponent.onActionRadiusChange(app.radius);
        // FusionLayerComponent.emitActionRadiusChange(app.radius);
        // GeoLayerStaticComponent.emitActionRadiusChange(app.radius);
    });
  }


  ngOnDestroy(): void {
    this.turnOffLocationUpdates();
  }

  turnOnLocationUpdates(): void {
      if (this.locationUpdateSubscription) {return; }

      this.locationUpdateSubscription = this.locationUpdate
          .getObservable(
              MovilidadComponent.DISTANCE_TOLERANCE,
              MovilidadComponent.LOCATION_UPDATES_INTERVAL
          )
          .subscribe((latLng: { lat: number; lng: number }): void => {
              console.log('new location update ' + JSON.stringify(latLng));
              if (!this.firstLocationCenterMap) {
                  this.firstLocationCenterMap = true;
                  const latLng_: google.maps.LatLng = new google.maps.LatLng(
                      latLng.lat,
                      latLng.lng
                  );
                  MapService.map.setCenter(latLng_);
              }
              this.myLocationComponent.createUpdatePositionMarker(
                  latLng.lat,
                  latLng.lng
              );
              FusionLayerComponent.emitLocationChange({
                  lat: latLng.lat,
                  lng: latLng.lng
              });
          });
      console.log(
          MovilidadComponent.name +
              ' turnOnLocationUpdates ' +
              this.locationUpdateSubscription.closed
      );
  }
  
  turnOffLocationUpdates(): void {
      if (this.locationUpdateSubscription) {
          this.locationUpdateSubscription.unsubscribe();
      }
      console.log(
          MovilidadComponent.name +
              ' turnOffLocationUpdates ' +
              this.locationUpdateSubscription.closed
      );
  }

  async onClickMyLocationButton() {
      // let geoposition: Geoposition = this.locationChange.getGeoposition();

      const geoposition: {
          lat: number;
          lng: number;
          time: number;
      } = await this.locationUpdate.getCurrentGeoposition();

      /*        let geoposition: Geoposition = this.locationChange.getGeoposition();*/
      this.myLocationComponent.createUpdatePositionMarker(
          geoposition.lat,
          geoposition.lng
      );
      FusionLayerComponent.emitLocationChange({
          lat: geoposition.lat,
          lng: geoposition.lng
      });
      /*  GeoLayerStaticComponent.emitLocationChange({
            lat: geoposition.coords.latitude
          , lng: geoposition.coords.longitude
      });*/
      MapService.map.panTo(
          new google.maps.LatLng(geoposition.lat, geoposition.lng)
      );
      this.turnOnLocationUpdates();
  }

  onClickPedestrian(latLng: { lat: number; lng: number }): void {}

  onDragendPedestrian(latLng: { lat: number; lng: number }): void {
      this.turnOffLocationUpdates();
      FusionLayerComponent.emitLocationChange(latLng);
  }
}
