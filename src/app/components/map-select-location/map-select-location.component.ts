import { ModalController } from '@ionic/angular';
import { GeoLayerDynamicComponent } from './../geo-layer-dynamic/geo-layer-dynamic.component';
import { GeoLayerComponent } from './../geo-layer/geo-layer.component';
import { MapService } from './../../providers/map.service';
import { TerritorioService } from './../../providers/territorio.service';
import { LocationChangeService } from '../../providers/location-change.service';
import { LayerService } from '../../providers/layer.service';
import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { Municipality } from '../../entities/municipality';
import { Common } from './../../shared/utilidades/common.service';
import { FusionLayerComponent } from '../fusion-layer/fusion-layer.component';
import { MyLocationComponent } from '../my-location/my-location.component';
import { ActivatedRoute } from '@angular/router';
import { AppLayer } from '../../entities/app-layer';
import { MapStyle } from '../../shared/utilidades/map-style';

@Component({
  selector: 'map-select-location',
  templateUrl: './map-select-location.component.html',
  styleUrls: ['./map-select-location.component.scss'],
})
export class MapSelectLocationComponent implements OnInit {

  static municipalities: Municipality[];
  private static map: google.maps.Map;

  @ViewChild(MyLocationComponent)
  private myLocationComponent: MyLocationComponent;

  @ViewChild(FusionLayerComponent)
  private fusionLayerSearchComponent: FusionLayerComponent;

  @Input()
  private desde: string;
  private fromOriginPage: string;

  private actionRadius: number;
  @Input()
  private color: any;
  private municipios: any;
  private geoposition: Geoposition;
  private amvaRadius = 40000;
  private autocompleteItemsUbicacion: any[] = [];
  private GoogleAutocomplete: any;
  private ubication: string;
  private geocoder: any;
  private centerOfMap = new google.maps.LatLng(0, 0);
  private mapOptions: any = {};
  private centerAMVA: any = { lat: 6.273357, lng: -75.46679 };

  private limitAMVA: any = new google.maps.LatLngBounds(
      new google.maps.LatLng(6.273357, -75.46679),
      new google.maps.LatLng(5.986228, -75.619267));

  constructor(private common: Common,
              private zone: NgZone,
              private layerProvider: LayerService,
              private locationChange: LocationChangeService,
              private territorioProvider: TerritorioService,
              private mapProvider: MapService,
              private modalCtrl: ModalController) {
                console.log(this.color);
                this.fromOriginPage = this.desde;
                this.geocoder = new google.maps.Geocoder();
                this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
                this.geoposition = this.locationChange.getGeoposition();
                this.centerOfMap = new google.maps.LatLng(this.geoposition.coords.latitude, this.geoposition.coords.longitude);
               }

  ngOnInit() {
    this.territorioProvider.getAmvaMunicipalities().then(
      (municipalities: Municipality[]): void => {
          this.municipios = municipalities;
          this.loadMunicipalitiesToMap();
      },
      (error: any): void =>
          console.log(MapSelectLocationComponent.name + ' ngOnInit getAmvaMunicipalities error ' + JSON.stringify(error))
    );
    this.layerProvider.currentAppChange$.subscribe(
        (app: AppLayer) => {
            console.log('la app', app);
            this.actionRadius = app.radius;
            // this.color = app.color;
            this.myLocationComponent.onActionRadiusChange(app.radius);
            FusionLayerComponent.emitActionRadiusChange(app.radius);
            GeoLayerComponent.emitActionRadiusChange(app.radius);
            GeoLayerDynamicComponent.emitActionRadiusChange(app.radius);
        }
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
    this.setupMarker();
  }

  setupMap(): void {
    MapSelectLocationComponent.map = new google.maps.Map(
        document.getElementById('map-selection')
        , this.mapOptions);
    google.maps.event.addListener(MapSelectLocationComponent.map, 'bounds_changed', () => {
    });
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
                  map: MapSelectLocationComponent.map,
                  fillColor: '#D9EBB8',
                  strokeColor: '#96C93D'
              });
          }
      );
  }


  setupMarker(): void {
      const marker = new google.maps.Marker({
          position: this.centerOfMap,
          map: MapSelectLocationComponent.map,
          icon: {
              scaledSize: new google.maps.Size(50, 50),
              url: 'assets/mapa/ubicacion.svg'
          },
          animation: google.maps.Animation.DROP,
      });
      marker.bindTo('position', MapSelectLocationComponent.map, 'center');
  }

  selectLocation(): void {
      const location = MapSelectLocationComponent.map.getCenter();
      const geoposition: Geoposition = {
          coords: {
              accuracy: -1,
              altitude: -1,
              altitudeAccuracy: -1,
              heading: -1,
              latitude: location.lat(),
              longitude: location.lng(),
              speed: -1
          },
          timestamp: -1
      };
      // this.common.dismissModal(geoposition, 'OK');
      this.modalCtrl.dismiss(geoposition, 'OK');
  }

  emptyDirection() {
      this.ubication = '';
  }


  searchDirection(address: any): void {
      // Buscamos la direccion destino ingresada por el usuario
      this.resultadosDireccion();
  }

  codificarDireccion(data: any): Promise<any> {
      const geocoder = new google.maps.Geocoder();
      let config: any;

      const defaultBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(6.075967, -75.633433),
          new google.maps.LatLng(6.450092, -75.323971)
      );
      config = { address: data, bounds: defaultBounds, region: 'CO' };
      return new Promise((resolve, reject) => {
          geocoder.geocode(config,  (results, status) => {
              if (status === google.maps.GeocoderStatus.OK) {
                  const data2 = {
                      latitud: results[0].geometry.location.lat(),
                      longitud: results[0].geometry.location.lng(),
                      descripcion: results[0].formatted_address
                  };

                  resolve(data2);
              } else {
                  console.error('Mapselection:codificarDireccion-error', status);
                  reject(status);
              }
          });
      });
  }

  // Lista de resultados de direcciones
  resultadosDireccion() {
      if (this.ubication === '' || this.ubication.length < 2) {
          this.autocompleteItemsUbicacion = [];
          return;
      }
      const circle = new google.maps.Circle({
          center: this.centerAMVA,
          radius: this.amvaRadius
      });
      const defaultBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(6.075967, -75.633433),
          new google.maps.LatLng(6.450092, -75.323971)
      );
      // this.GoogleAutocomplete.aut;
      this.GoogleAutocomplete.getPlacePredictions(
          {
              input: this.ubication,
              componentRestrictions: { country: 'co' },
              bounds: this.limitAMVA,
              strictBounds: true,
              location: new google.maps.LatLng(6.273357, -75.46679),
              radius: 40000,
              rankBy: google.maps.places.RankBy.DISTANCE,
          }
          ,
          (predictions: any) => {
              this.autocompleteItemsUbicacion = [];
              this.zone.run(() => {
                  if (predictions != null) {
                      predictions.forEach(prediction => {
                          this.autocompleteItemsUbicacion.push(prediction);
                      });
                  }
              });
          }
      );
  }

  selectDirection(item: any) {
      // se ubica el marker el la direccion seleccionada por el usuario
      this.ubication = item.description;
      this.autocompleteItemsUbicacion = [];

      this.geocoder.geocode({ placeId: item.place_id }, (results, status) => {
          if (status === 'OK' && results[0]) {
              const position = {
                  lat: results[0].geometry.location.lat(),
                  lng: results[0].geometry.location.lng(),
              };
              this.centerOfMap = new google.maps.LatLng(position.lat, position.lng);
              this.mapOptions.center = this.centerOfMap;
              this.mapOptions.zoom = 17;
              this.setupMap();
              this.setupMarker();
          }
      });
  }

  closeModal() {
      // this.common.dismissModal();
      this.modalCtrl.dismiss();
  }

  onClickMyLocationButton(): void {
      const geoposition: Geoposition = this.locationChange.getGeoposition();
      this.myLocationComponent.createUpdatePositionMarker(geoposition.coords.latitude, geoposition.coords.longitude);
      FusionLayerComponent.emitLocationChange({
          lat: geoposition.coords.latitude
          , lng: geoposition.coords.longitude
      });
      GeoLayerComponent.emitLocationChange({
          lat: geoposition.coords.latitude
          , lng: geoposition.coords.longitude
      });
      GeoLayerDynamicComponent.emitLocationChange({
          lat: geoposition.coords.latitude
          , lng: geoposition.coords.longitude
      });
      MapSelectLocationComponent.map.panTo(new google.maps.LatLng(geoposition.coords.latitude, geoposition.coords.longitude));
  }

}
