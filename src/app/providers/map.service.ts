import { Injectable } from '@angular/core';
import { AppLayer } from '../entities/app-layer';
import { GeoLayer } from '../entities/geo-layer';
import { Layer } from '../entities/layer';
import { Common } from '../shared/utilidades/common.service';
import { MapStyle } from '../shared/utilidades/map-style';

@Injectable({
  providedIn: 'root'
})
export class MapService {

//   static map: google.maps.Map;
  static map = null;

  constructor(private common: Common) { }

  initMap(): void {
    MapService.map = new google.maps.Map(
        document.getElementById('map'),
        {
            zoom: 14,
            center: { lat: 6.263527, lng: -75.5559108 },
            disableDefaultUI: true,
            styles: MapStyle.estiloMapa,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
 }

getMap(): any { return MapService.map; }

cleanLayer(layer: Layer): Layer {
  layer.selected = false;
  if (layer instanceof GeoLayer) {
      layer.visible = false;
      if (layer.markers) {
          layer.markers.forEach((marker: google.maps.Marker) => {
              marker.setMap(null);
          });
      }
      if (layer.polygons) {
          layer.polygons.forEach((polygon: google.maps.Polygon) => {
              polygon.setMap(null);
          });
      }
      /* 29/07/2019 from google.maps.data.Polygon to google.maps.Polygon change 8
      *if (layer.dataFeatures) {
          layer.dataFeatures.forEach((feature: google.maps.Data.Feature) => {
             // if (MapProvider.map) MapProvider.map.data.remove(feature);
             google.maps.event.clearInstanceListeners(feature);
             MapProvider.map.data.remove(feature);
            //  MapProvider.map.data.overrideStyle(feature, { visible: false});
          });
      }*/
  }
  else if (layer.children) {
      layer.children.forEach((layer_: GeoLayer) => {
          layer_.visible = false;
          layer_.selected = false;
          if (layer_.markers) {
              layer_.markers.forEach((marker_: google.maps.Marker) => {
                  marker_.setMap(null);
              });
          }
          if (layer_.polygons) {
              layer_.polygons.forEach((polygon_: google.maps.Polygon) => {
                  polygon_.setMap(null);
              });
          }
          /* 29/07/2019 from google.maps.data.Polygon to google.maps.Polygon change 9
          * if (layer_.dataFeatures) {
              layer_.dataFeatures.forEach((feature_: google.maps.Data.Feature) => {
                  if (MapProvider.map) {
                      //MapProvider.map.data.remove(feature_);
                      MapProvider.map.data.overrideStyle(feature_, { visible: false});
                  }
              });
          }*/
      });
      this.common.stackActiveLayersSubcapas = this.common.stackActiveLayersSubcapas.filter(id => {
          return id !== layer.id;
      });
  }
  return layer;
}

cleanApp(app: AppLayer): AppLayer {
  app.children = app.children.map((layer: Layer) => {

      return this.cleanLayer(layer);
  });
  this.common.stackActiveLayersSubcapas = [];
  return app;
}



}
