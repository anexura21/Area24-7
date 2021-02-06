import { MapService } from './../../providers/map.service';
import { FusionLayerComponent } from './../fusion-layer/fusion-layer.component';
import { LocationUpdateService } from './../../providers/location-update.service';
import { LayerService } from './../../providers/layer.service';
import { LocationChangeService } from './../../providers/location-change.service';
import { Common } from './../../shared/utilidades/common.service';
import { TerritorioService } from './../../providers/territorio.service';
import { Subscription } from 'rxjs';
import { LayerManagerComponent } from './../layer-manager/layer-manager.component';
import { MyLocationComponent } from './../my-location/my-location.component';
import { AppLayer } from './../../entities/app-layer';
import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';

@Component({
  selector: 'huellas',
  templateUrl: './huellas.component.html',
})
export class HuellasComponent implements OnInit, OnDestroy {

  static readonly LOCATION_UPDATES_INTERVAL: number = 5000;
    static readonly DISTANCE_TOLERANCE: number = 0;


    @Input()
    public app: AppLayer;

    @ViewChild(MyLocationComponent)
    private myLocationComponent: MyLocationComponent;

    @ViewChild(LayerManagerComponent)
    private layerManagerComponent: LayerManagerComponent;
    private locationUpdateSubscription: Subscription;
    private firstLocationCenterMap = false;



    private timerId: any;
    private actionRadius: number;

    constructor(private territorioProvider: TerritorioService,
                private common: Common,
                private locationChange: LocationChangeService,
                private layerProvider: LayerService,
                private locationUpdate: LocationUpdateService
                )
    {}


    ngOnInit(): void {
        console.log('HuellasComponent ngOnInit');
        this.layerProvider.currentAppChange$.subscribe(
            (app: AppLayer) => {
                this.actionRadius = app.radius;
                this.myLocationComponent.onActionRadiusChange(app.radius);
                FusionLayerComponent.emitActionRadiusChange(app.radius);
            }
        )
        // SideMenu.actionRadiusChanged$.subscribe(
        //     (actionRadius: number): void => {
                // this.actionRadius = actionRadius;
                // this.myLocationComponent.onActionRadiusChange(actionRadius);
                // FusionLayerComponent.emitActionRadiusChange(actionRadius);
        //     }
        // );

        this.onClickMyLocationButton();
    }


    ngOnDestroy(): void {
        this.turnOffLocationUpdates();
    }

    turnOnLocationUpdates(): void {
        if (this.locationUpdateSubscription && !this.locationUpdateSubscription.closed) {return; }

        this.locationUpdateSubscription = this.locationUpdate
            .getObservable(HuellasComponent.DISTANCE_TOLERANCE, HuellasComponent.LOCATION_UPDATES_INTERVAL)
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
        console.log(HuellasComponent.name + ' turnOnLocationUpdates ' + this.locationUpdateSubscription.closed);
    }

    turnOffLocationUpdates(): void {
        if (this.locationUpdateSubscription) {this.locationUpdateSubscription.unsubscribe(); }
        console.log(HuellasComponent.name + ' turnOffLocationUpdates ' + this.locationUpdateSubscription.closed);
    }


    async onClickMyLocationButton() {
      // let geoposition: Geoposition = this.locationChange.getGeoposition();

      const geoposition: { lat: number, lng: number, time: number } = await this.locationUpdate.getCurrentGeoposition();

      /*let geoposition: Geoposition = this.locationChange.getGeoposition();*/
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


    onDragendPedestrian(latLng: { lat: number, lng: number }): void {
        this.turnOffLocationUpdates();
        FusionLayerComponent.emitLocationChange(latLng);
    }

}
