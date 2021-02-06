import { MapService } from './../../providers/map.service';
import { LayerService } from './../../providers/layer.service';
import { GooglemapsService } from './../../providers/googlemaps.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { GeoLayerComponent } from '../geo-layer/geo-layer.component';
import { NavController } from '@ionic/angular';
import { Subject } from 'rxjs';

@Component({
  selector: 'geo-layer-dynamic',
  templateUrl: './geo-layer-dynamic.component.html',
  styleUrls: ['./geo-layer-dynamic.component.scss'],
})
export class GeoLayerDynamicComponent extends GeoLayerComponent implements OnInit, OnDestroy  {

  private static focusOnGeometry = new Subject<number>();

  private static focusOnGeometry$ = GeoLayerDynamicComponent.focusOnGeometry.asObservable();

  private static currentInfoWindow: google.maps.InfoWindow;

  static emitFocusOnGeometry(id: number): void {
      GeoLayerDynamicComponent.focusOnGeometry.next(id);
  }


  constructor(private layerProvider: LayerService,
              private navCtrl: NavController,
              private googleMaps: GooglemapsService) {
    super();
  }

  ngOnInit() {
    if (this.fixedActionRadius) {this.actionRadius = this.fixedActionRadius; }

    GeoLayerDynamicComponent.actionRadiusChanged$.subscribe(
        (actionRadius: number): void => {
            if (!this.fixedActionRadius) {
                this.actionRadius = actionRadius;
                if (this.layer.visible) {this.loadIntoMap(); }
            }
        }
    );
    GeoLayerDynamicComponent.locationChanged$.subscribe(
        (latLng: { lat: number, lng: number }) => {
            GeoLayerDynamicComponent.currentLat = latLng.lat;
            GeoLayerDynamicComponent.currentLng = latLng.lng;
            if (this.layer.visible) {this.loadIntoMap(); }
        }
    );
    GeoLayerDynamicComponent.focusOnGeometry$.subscribe(
        (id: number) => {
            if (this.layer.markers) {
                const marker: google.maps.Marker = this.layer.markers.find((marker_: google.maps.Marker) => marker_['id'] === id);
                if (marker) {
                    marker.setVisible(true);
                    marker['alwaysVisible'] = true;
                    MapService.map.panTo(marker.getPosition());
                  //   this.getGeometryInfoAndShowInfoWindow(id, marker.getPosition());
                }
            }
            else if (this.layer.polygons) {
                const polygon: google.maps.Polygon = this.layer.polygons.find((polygon_: google.maps.Polygon) => polygon_['id'] === id);
                if (polygon) {
                    const latLng = polygon.getPath().getArray()[0];
                    MapService.map.panTo(latLng);
                    // this.getGeometryInfoAndShowInfoWindow(id, latLng);
                }
            }
        }
    );
    }

    ngOnDestroy(): void {
        if (GeoLayerDynamicComponent.currentInfoWindow) {
          GeoLayerDynamicComponent.currentInfoWindow.close();
        }
    }

    getLegendColor(id: number): string {
        switch (id) {
            case 21: // Áreas protegidas
                return '#F9A52B';

            case 66: // Retiros de quebradas
                return '#1469AA';

            case 13: // Tratamiento de suelos Urbanos
                return '#5D3B89';

            case 64: // Uso de suelos Urbanos
                return '#3B294C';

            case 122: // Uso de sulos Rurales
                return '#85B727';

            case 124: // Tratamiento de suelos Rurales
                return '#5D8407';

            default:
                return '#000000';
        }
    }

    getSquarePolygonCenter(polygon: google.maps.Polygon): google.maps.LatLng {
        const path = polygon.getPath().getArray();
        let minLat: number = path[0].lat();
        let maxLat: number = path[0].lat();
        let minLng: number = path[0].lng();
        let maxLng: number = path[0].lng();
        for (let i = 1; i < path.length; i++) {
            if (path[i].lat() > maxLat) {maxLat = path[i].lat(); }
            else if (path[i].lat() < minLat) {minLat = path[i].lat(); }

            if (path[i].lng() > maxLng) {maxLng = path[i].lng(); }
            else if (path[i].lng() < minLng) {minLng = path[i].lng(); }
        }

        return new google.maps.LatLng(
              minLat + (maxLat - minLat) / 2
            , minLng + (maxLng - minLng) / 2
        );
    }

    onTapLayer(): void {
        console.log('geo layer', this.layer);
        if (this.layer.visible) {
            this.layer.visible = false;
            this.setVisible(false);
            this.common.activeLayers.ids = this.common.activeLayers.ids.filter(id => id !== this.layer.id);
        }
        else if (this.layer.markers === undefined && this.layer.polylines === undefined && this.layer.polygons === undefined) {
            this.layer.visible = true;
            this.loadIntoMap();
            this.common.activeLayers.level = this.layerLevel;
            this.common.activeLayers.ids.push(this.layer.id);
        }
        else {
            this.setGeometriesMap();
            this.layer.visible = true;
            this.setVisible(true);
            this.common.activeLayers.ids.push(this.layer.id);
        }
    }

    setGeometriesMap(): void {
        if (this.layer.markers) {
          this.layer.markers.
                forEach((marker: google.maps.Marker): void => marker.setMap(MapService.map));
        }
        if (this.layer.polygons) {
          this.layer.polygons.
                forEach((polygon: google.maps.Polygon): void => polygon.setMap(MapService.map));
        }
    }

    loadIntoMap(): void {
        this.isLoading = true;
        this.layerProvider.
              getGeometriesByRadius(this.layerLevel, this.layer.id,
                                    GeoLayerDynamicComponent.currentLat,
                                    GeoLayerDynamicComponent.currentLng,
                                    this.actionRadius).subscribe(
            response => {
                console.log(GeoLayerDynamicComponent.name + ' getGeometriesByRadius ' + JSON.stringify(response));
                const jsonResponse = JSON.parse(JSON.stringify(response));
                const newMarkers: google.maps.Marker[] =
                jsonResponse.markersPoint.map((item: any) => this.apiMarkerToGoogleMarker(item));
                const oldMarkers: google.maps.Marker[] = this.layer.markers || [];
                this.layer.markers = new Array<google.maps.Marker>();
                newMarkers.forEach((newMarker: google.maps.Marker): void => {

                  const intersectionMarkerIndex: number =
                        oldMarkers.
                            findIndex((oldMarker: google.maps.Marker) =>
                                                  ( newMarker['id'] === oldMarker['id'])
                                                  );
                  if (intersectionMarkerIndex !== -1) {
                      this.layer.markers.push(oldMarkers[intersectionMarkerIndex]);
                      oldMarkers.splice(intersectionMarkerIndex, 1);
                  }
                  else {
                      newMarker.setMap(MapService.map);
                      this.layer.markers.push(newMarker);
                  }
                });
                oldMarkers.forEach((marker: google.maps.Marker): void => marker.setMap(null));
                this.setVisible(true);
                this.isLoading = false;
            },
            (error: any): void => {
                console.log(GeoLayerDynamicComponent.name + ' getGeometriesByRadius error ' + JSON.stringify(error));
                this.isLoading = false;
            }
        );
      }

    setVisible(visible: boolean): void {
        if (this.layer.markers !== undefined) {
          this.layer.markers.forEach((marker: google.maps.Marker) => marker.setVisible(visible));
        }
        if (this.layer.polylines !== undefined) {
          this.layer.polylines.forEach((polyline: google.maps.Polyline) => polyline.setVisible(visible));
        }
        if (this.layer.polygons !== undefined) {
          this.layer.polygons.forEach((polygon: google.maps.Polygon) => polygon.setVisible(visible));
        }
    }

    apiMarkerToGoogleMarker(json: any): google.maps.Marker {
        const marker = new google.maps.Marker({
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(json.point.lat, json.point.lng),
            map: null,
            icon: {
                url: json.rutaWebIcono,
                scaledSize: new google.maps.Size(40, 40)
            },
            visible: false
        });
        marker['id'] = json.idMarker;
        marker.addListener('click',
            (args = {}) => {
                // this.navCtrl.push(AvistamientoDetailComponent, {
                //     avistamientoId: marker['id']
                // });
        });
        return marker;
    }

    apiPolygonToGooglePolygon(json: any, color: string): google.maps.Polygon {
        const decoded = google.maps.geometry.encoding.decodePath(json.encodedPolygon);
        const paths = decoded.map(item => {
                    return {lat: item.lat(), lng: item.lng()};
                  });
        const polygon = new google.maps.Polygon({
            paths,
            map: MapService.map,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.35
        });
        polygon['id'] = json.id;
        polygon.addListener('click',
            (args = {}) => {
            //     this.navCtrl.push(AvistamientoDetailComponent, {
            //         avistamientoId: polygon['id']
            // });
      });
        return polygon;
    }

    getColorSelectedLayer(): string {
        return this.layer.visible
            ? this.color
            : null;
    }

}
