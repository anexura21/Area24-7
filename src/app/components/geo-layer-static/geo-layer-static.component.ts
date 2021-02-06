import { LayerService } from './../../providers/layer.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { MapService } from '../../providers/map.service';
import { GeoLayer } from '../../entities/geo-layer';
import { GeoLayerComponent } from '../geo-layer/geo-layer.component';

@Component({
  selector: 'geo-layer-static',
  templateUrl: './geo-layer-static.component.html',
  styleUrls: ['./geo-layer-static.component.scss'],
})
export class GeoLayerStaticComponent extends GeoLayerComponent implements OnInit, OnDestroy {

  private static currentInfoWindow: google.maps.InfoWindow;

  private static focusOnGeometry = new Subject<number>();

  private static focusOnGeometry$ = GeoLayerStaticComponent.focusOnGeometry.asObservable();

  @Input()
  protected layer: GeoLayer;


  static emitFocusOnGeometry(id: number): void {
      GeoLayerStaticComponent.focusOnGeometry.next(id);
  }


  constructor(private layerProvider: LayerService) {
    super();
  }

  ngOnInit() {
    console.log('geo layer', this.layer);

    if (this.fixedActionRadius) {this.actionRadius = this.fixedActionRadius; }

    GeoLayerStaticComponent.actionRadiusChanged$.subscribe(
        (actionRadius: number): void => {
            if (!this.fixedActionRadius) {
                this.actionRadius = actionRadius;
                this.setMarkersVisibleByRadius();
            }
        }
    );
    GeoLayerStaticComponent.locationChanged$.subscribe(
        (latLng: { lat: number, lng: number }) => {
            GeoLayerStaticComponent.currentLat = latLng.lat;
            GeoLayerStaticComponent.currentLng = latLng.lng;
            this.setMarkersVisibleByRadius();
        }
    );
    GeoLayerStaticComponent.focusOnGeometry$.subscribe(
        (id: number) => {
            if (this.layer.markers) {
                const marker: google.maps.Marker = this.layer.markers.find((marker_: google.maps.Marker) => marker_['id'] == id);
                if (marker) {
                    marker.setVisible(true);
                    marker['alwaysVisible'] = true;
                    MapService.map.panTo(marker.getPosition());
                    this.getGeometryInfoAndShowInfoWindow(id, marker.getPosition());
                }
            }
            else if (this.layer.polygons) {
                const polygon: google.maps.Polygon = this.layer.polygons.find((polygon_: google.maps.Polygon) => polygon_['id'] == id);
                if (polygon) {
                    const latLng = polygon.getPath().getArray()[0];
                    MapService.map.panTo(latLng);
                    this.getGeometryInfoAndShowInfoWindow(id, latLng);
                }
            }
        }
    );
  }

  ngOnDestroy(): void {
    if (GeoLayerStaticComponent.currentInfoWindow) {GeoLayerStaticComponent.currentInfoWindow.close(); }       
}

getLegendColor(): string {
    switch (this.layer.id) {
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

//TODO: move all these layer dependent logic out from here
onTapLayer(): void {
    console.log('geo layer', this.layer);

    const idsThatCleanOtherLayers: number[] = [
        185, // Avistamientos - Buscador
        5,   // Avistamientos - Mis avistamientos
        10,  // Mi Entorno - Calidad del aire
        11,  // Mi Entorno - Monitoreo hídrico
        12,  // Mi Entorno - Clima
        13   // Mi Entorno - Suelos
    ];
    const clearLayer = idsThatCleanOtherLayers.find( element => {
        return element === this.layer.id;
    });

    if (this.layerLevel === 'CAPA' && clearLayer && !this.layer.visible) { // emit to clean all other layers
        this.tapLayer.emit(this.layer);
    }

    if (this.layer.visible) {
        this.layer.visible = false;
        this.setVisible(false);
        this.common.activeLayers.ids = this.common.activeLayers.ids.filter(id => id != this.layer.id);
    }
    else if (this.layer.id === 185) { // Avistamientos - Buscador
        // let modal: Modal = this.common.createModal(BusquedaAvistamientosComponent);
        // modal.onDidDismiss((data: any, role: string): void => {
        //     if (data) {
        //         this.layer.visible = true;
        //         this.loadIntoMapSearchResult(data.name);
        //         this.common.activeLayers.level = this.layerLevel;
        //         this.common.activeLayers.ids.push(this.layer.id);
        //     }
        // });
        // modal.present();
    }
    else if (this.layer.markers === undefined &&
              this.layer.polylines === undefined &&
              this.layer.polygons === undefined) {
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
        this.layer.markers.forEach((marker: google.maps.Marker): void => marker.setMap(MapService.map));
      }
    if (this.layer.polygons) {
        this.layer.polygons.forEach((polygon: google.maps.Polygon): void => polygon.setMap(MapService.map));
      }
}

loadIntoMapSearchResult(name: string): void {
    this.isLoading = true;
    this.layerProvider.search({ lat: GeoLayerStaticComponent.currentLat, lng: GeoLayerStaticComponent.currentLng }, name).subscribe(
        response => {
            const jsonResponse = JSON.parse(JSON.stringify(response));
            const color: string = this.getLegendColor();
            if (jsonResponse.markersPoint) {
                this.layer.markers = jsonResponse.markersPoint.map((item: any) => this.apiMarkerToGoogleMarker(item));
              }
            if (jsonResponse.markersPolygon) {
                this.layer.polygons = jsonResponse.markersPolygon.map((item: any) => this.apiPolygonToGooglePolygon(item, color));
              }
            this.setVisible(true);
            this.isLoading = false;
        },
        (error: any) => {
            console.log('loadIntoMap error ' + JSON.stringify(error));
            this.isLoading = false;
        }
    );
}

loadIntoMap(): void {
    this.isLoading = true;
    this.layerProvider.getAllGeometries(this.layerLevel, this.layer.id).subscribe(
        response => {
            const jsonResponse = JSON.parse(JSON.stringify(response));
            const color: string = this.getLegendColor();
            if (jsonResponse.markersPoint) {
                this.layer.markers = jsonResponse.markersPoint.map((item: any) => this.apiMarkerToGoogleMarker(item));
            }
            if (jsonResponse.markersPolygon) {
                this.layer.polygons = jsonResponse.markersPolygon.map((item: any) => this.apiPolygonToGooglePolygon(item, color));
            }
            this.setVisible(true);
            this.isLoading = false;
        },
        (error: any) => { 
            console.log('loadIntoMap error ' + JSON.stringify(error));
            this.isLoading = false;
        }
    );
}

setVisible(visible: boolean): void {
    if (this.layer.markers !== undefined) {
        if (visible) {this.setMarkersVisibleByRadius(); }
        else {this.layer.markers.forEach((marker: google.maps.Marker) => marker.setVisible(false)); }
    }
    if (this.layer.polylines !== undefined) {
        this.layer.polylines.forEach((polyline: google.maps.Polyline) => polyline.setVisible(visible));
    }
    if (this.layer.polygons !== undefined) {
      this.layer.polygons.forEach((polygon: google.maps.Polygon) => polygon.setVisible(visible));
    }
}

setMarkersVisibleByRadius(): void {
    if (this.layer.markers !== undefined && this.layer.visible) {
        const originLatLng: google.maps.LatLng =
          new google.maps.LatLng(GeoLayerStaticComponent.currentLat, GeoLayerStaticComponent.currentLng);        
        this.layer.markers.forEach((marker: google.maps.Marker) => {
            if (marker['alwaysVisible']) {marker.setVisible(true); }
            else {
                const distance = google.maps.geometry.spherical.computeDistanceBetween(originLatLng, marker.getPosition());
                marker.setVisible(distance <= this.actionRadius);
            }
        });
    }
}

getGeometryInfoAndShowInfoWindow(id: number, latLng: any): void {
    this.layerProvider.getMarkerInfo(id).subscribe(
        (response: Response) => {
            console.log('getMarkerInfo ' + JSON.stringify(response));
            this.showInfoWindow(response.json(), latLng);
        },
        (error: any) => console.log('getMarkerInfo error ' + JSON.stringify(error)));
}

apiMarkerToGoogleMarker(json: any): google.maps.Marker {
    const marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(json.point.lat, json.point.lng),
        map: MapService.map,
        icon: {
            url: json.rutaWebIcono,
            scaledSize: new google.maps.Size(40, 40)
        },
        visible: false
    });
    marker['id'] = json.idMarker;
    marker.addListener('click', (args: any = {}) => {
        if (this.layerLevel === 'CAPA' && this.layer.id === 5) { // Mis avistamientos
            // this.navCtrl.push(AvistamientoDetailComponent, {
            //     avistamientoId: marker['id']
            // });
        }
        else if (this.layerLevel === 'CAPA' && this.layer.id === 185) { // Buscador
            // this.navCtrl.push(AvistamientoDetailComponent, {
            //     avistamientoId: marker['id']
            // });
        }
        else {this.getGeometryInfoAndShowInfoWindow(marker['id'], args.latLng); }
    });
    return marker;
}

apiPolygonToGooglePolygon(json: any, color: string): google.maps.Polygon {
    const decoded = google.maps.geometry.encoding.decodePath(json.encodedPolygon);
    const paths = decoded.map(item => {
          return { lat: item.lat(), lng: item.lng() }; });
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
    polygon.addListener('click', (args: any = {}) => {
        this.getGeometryInfoAndShowInfoWindow(polygon['id'], args.latLng);
  });
    return polygon;
}

showInfoWindow(info: any, latLng: any): void {
    const contentString = `
        <style>
            .gm-style-iw {
                height: 100% !important;
            }

            .boton_personalizado {
                text-decoration: none;
                max-height: 4rem;
                padding: 0.8rem;
                background-color: transparent;
                border-radius: 6px;
                //border: 1px solid #006FAC;
                width: 20%;
                margin: 0 auto;
            }
        </style>
        <div id="div-main-infoWindow">
            <div id="siteNotice"></div>
            <div class="styleHeader" style="background-color:${this.color}">
                <div>
                    <img src="${this.layer.urlIconMarker}" style="width:20%; margin-top:4px;">
                </div>
                <div>
                    <label class="styleTitle">${info.nombre}</label>
                </div>
            </div>
            <div>
                <div class="description">
                    <p class="infoGeneral">${info.descripcion}</p>
                </div>
                <hr style="width: 95%; margin: 0.5rem auto;">
                <!-- Todo: Agregar color del borde parametrizable -->
                <div class="boton_personalizado" id="infoWindowButtonRoutes" style="border: 1px solid #000">
                    <img style="height:15px; width:auto; position: relative;" src="assets/movilidad/iconos/rutas.png" >  
                </div>
            <div>`
    if (GeoLayerStaticComponent.currentInfoWindow) {GeoLayerStaticComponent.currentInfoWindow.close(); }

    GeoLayerStaticComponent.currentInfoWindow = new google.maps.InfoWindow({
        content: contentString
    });
    GeoLayerStaticComponent.currentInfoWindow.setPosition(latLng);
    GeoLayerStaticComponent.currentInfoWindow.open(MapService.map);
    MapService.map.panTo(latLng);
    document.getElementById('infoWindowButtonRoutes').addEventListener('click', () => {
        // this.posiblesViajesProvider.origen.lat = GeoLayerStaticComponent.currentLat;
        // this.posiblesViajesProvider.origen.lon = GeoLayerStaticComponent.currentLng;
        // this.posiblesViajesProvider.origen.descripcion = "Mi ubicación";
        // this.posiblesViajesProvider.destino.lat = latLng.lat();
        // this.posiblesViajesProvider.destino.lon = latLng.lng();
        // this.posiblesViajesProvider.destino.descripcion = info.descripcion;
        GeoLayerStaticComponent.currentInfoWindow.close();
        // this.posiblesViajesProvider
        //     .obtenerviajesSugeridos()
        //     .then(data => {
        //         this.appCtrl.getRootNav().push(VistaViajesPage, data);
        // })
        // .catch(error => {
        //     this.common
        //     .basicAlert(
        //       "Movilidad",
        //       error
        //     );
        // });
    });
}

getColorSelectedLayer(): string {
    return this.layer.visible
        ? this.color
        : null;
}

}
