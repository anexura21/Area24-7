import { MapService } from './../../providers/map.service';
import { Common } from './../../shared/utilidades/common.service';
import { LoadingController, ModalController } from '@ionic/angular';
import { LayerService } from './../../providers/layer.service';
import { LocationUpdateService } from './../../providers/location-update.service';
import { TerritorioService } from './../../providers/territorio.service';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { GeoLayer } from '../../entities/geo-layer';
import { AppLayer } from '../../entities/app-layer';
import { LayerManagerComponent } from '../layer-manager/layer-manager.component';
import { MyLocationComponent } from '../my-location/my-location.component';
import { FusionLayerComponent } from '../fusion-layer/fusion-layer.component';
import { GeoLayerStaticComponent } from '../geo-layer-static/geo-layer-static.component';
import { FichaCaracterizacionComponent } from '../ficha-caracterizacion/ficha-caracterizacion.component';

@Component({
  selector: 'territorio',
  templateUrl: './territorio.component.html'
})
export class TerritorioComponent implements OnInit, OnDestroy {

  static readonly LOCATION_UPDATES_INTERVAL: number = 5000;
  static readonly DISTANCE_TOLERANCE: number = 0;

  @Input()
  app: AppLayer;

  @ViewChild(MyLocationComponent)
  private myLocationComponent: MyLocationComponent;

  @ViewChild(LayerManagerComponent)
  layerManagerComponent: LayerManagerComponent;

  private locationUpdateSubscription: Subscription;
  private firstLocationCenterMap = false;

  private layerSearch: GeoLayer = new GeoLayer({
      id: -1,
      nombre: '',
      activo: true,
      favorito: true,
      nombreTipoCapa: 'BUSQUEDA'
  });

  constructor(private territorioProvider: TerritorioService,
              private locationUpdate: LocationUpdateService,
              private common: Common,
              private layerProvider: LayerService,
              private loadingCtrl: LoadingController,
              private modalCtrl: ModalController ) { }

  ngOnInit() {
    console.log('TerritorioComponent ngOnInit');

    this.layerProvider.currentAppChange$.subscribe((app: AppLayer) => {
        this.myLocationComponent.onActionRadiusChange(app.radius);
        FusionLayerComponent.emitActionRadiusChange(app.radius);
        GeoLayerStaticComponent.emitActionRadiusChange(app.radius);
    });

    this.onClickMyLocationButton();
  }

  async onClickMyLocationButton() {

    const geoposition: {
        lat: number;
        lng: number;
        time: number;
    } = await this.locationUpdate.getCurrentGeoposition();

    this.myLocationComponent.createUpdatePositionMarker(
        geoposition.lat,
        geoposition.lng
    );
    FusionLayerComponent.emitLocationChange({
        lat: geoposition.lat,
        lng: geoposition.lng
    });
    MapService.map.panTo(
        new google.maps.LatLng(geoposition.lat, geoposition.lng)
    );
    this.turnOnLocationUpdates();
  }

  turnOnLocationUpdates(): void {
    if (
        this.locationUpdateSubscription &&
        !this.locationUpdateSubscription.closed
    )
        {return; }

    this.locationUpdateSubscription = this.locationUpdate
        .getObservable(
            TerritorioComponent.DISTANCE_TOLERANCE,
            TerritorioComponent.LOCATION_UPDATES_INTERVAL
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
        TerritorioComponent.name +
            ' turnOnLocationUpdates ' +
            this.locationUpdateSubscription.closed
    );
  }

  ngOnDestroy(): void {
    this.turnOffLocationUpdates();
  }

  turnOffLocationUpdates(): void {
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Un momento por favor...',
      spinner: 'bubbles'
    });
    await loading.present();
  }

  async getModalFichaCaracterizacion(characterizationCard) {
    const modal = await this.modalCtrl.create({
        component: FichaCaracterizacionComponent, // FichaCaracterizacionComponent,
        componentProps: {
          characterizationCard
        }
    });
    await modal.present();
  }


  onClickPedestrian(latLng: { lat: number; lng: number }): void {
    // this.common.presentLoading();
    this.presentLoading();
    this.territorioProvider
        .getFullCharacterizationCard(latLng.lat, latLng.lng)
        .subscribe(
            response => {
                console.log(
                    TerritorioComponent.name +
                        ' onClickPedestrian getFullCharacterizationInfo ' +
                        JSON.stringify(response)
                );
                // this.common.dismissLoading();
                this.loadingCtrl.dismiss();
                this.getModalFichaCaracterizacion(response);
            },
            (error: any) => {
                console.log(
                    TerritorioComponent.name +
                        ' onClickPedestrian getFullCharacterizationInfo error ' +
                        JSON.stringify(error)
                );
            }
        );
    }

    onDragendPedestrian(latLng: { lat: number; lng: number }): void {
        console.log('Move marker');
        this.turnOffLocationUpdates();
        FusionLayerComponent.emitLocationChange(latLng);
    }

    onClickGoogleSuggestion(latLng: { lat: number; lng: number }): void {
        this.myLocationComponent.createUpdatePositionMarker(
            latLng.lat,
            latLng.lng
        );
        MapService.map.panTo(new google.maps.LatLng(latLng.lat, latLng.lng));
        FusionLayerComponent.emitLocationChange(latLng);
    }

    onClickApiSuggestion(id: number): void {
        this.turnOffLocationUpdates();
        FusionLayerComponent.emitFocusOnGeometry(id);
    }

}
