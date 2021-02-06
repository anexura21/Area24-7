import { PosiblesViajesService } from './../../providers/posibles-viajes.service';
import { PosconsumoMidemeService } from './../../providers/posconsumo-mideme.service';
import { PosconsumoDetail } from './../../entities/posconsumoDetail';
import { CuidameDetailComponent } from './../cuidame-detail/cuidame-detail.component';
import { ClimaDetalleComponent } from './../clima-detalle/clima-detalle.component';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { NavController, ModalController, PopoverController } from '@ionic/angular';

import { LayerComponent } from '../layer/layer.component';

import { AppLayer } from '../../entities/app-layer';
import { GeoLayer } from '../../entities/geo-layer';
import { MessageService } from './../../providers/message.service';
import { MapService } from './../../providers/map.service';
import { LayerService } from './../../providers/layer.service';
import { GooglemapsService } from './../../providers/googlemaps.service';
import { EstacionDisfrutameService } from '../../providers/estacion-disfrutame.service';
import { APPS } from '../../shared/apps';
import { DetalleEstacionComponent } from '../detalle-estacion/detalle-estacion.component';
import { TerritorioDetailComponent } from '../territorio-detail/territorio-detail.component';
import { DetallePosconsumoComponent } from './../detalle-posconsumo/detalle-posconsumo.component';

/**
 * Se debe configurar movilidad y mideme
 *
 */

@Component({
  selector: 'fusion-layer',
  templateUrl: './fusion-layer.component.html',
  styleUrls: ['./fusion-layer.component.scss'],
})
export class FusionLayerComponent extends LayerComponent
                implements OnInit, OnDestroy {
  public static flgIntegrationMovilidad = false;
  private static actionRadiusChange = new BehaviorSubject<number>(0);
  private static locationChange =
            new BehaviorSubject<{lat: number; lng: number; }>({ lat: 0, lng: 0 });
  private static focusOnGeometry = new Subject<number>();
  private static additionalParamsChange = new Subject<string>();
  private static deleteAllMarkers = new Subject<any>();
  private static deleteMarkersByLayerType = new Subject<any>();
  protected static actionRadiusChanged$ = FusionLayerComponent.actionRadiusChange.asObservable();
  protected static locationChanged$ = FusionLayerComponent.locationChange.asObservable();
  private static focusOnGeometry$ = FusionLayerComponent.focusOnGeometry.asObservable();
  private static additionalParamsChange$ = FusionLayerComponent.additionalParamsChange.asObservable();
  private static deleteAllMarkers$ = FusionLayerComponent.deleteAllMarkers.asObservable();
  private static deleteMarkersByLayerType$ = FusionLayerComponent.deleteMarkersByLayerType.asObservable();
  private static focusedGeometry: google.maps.Marker;
  protected static currentLat: number;
  protected static currentLng: number;
  private static currentInfoWindow: google.maps.InfoWindow;
  @Input()
  private app: AppLayer;

  // Pendiente cuando toque mideme
  // private posconsumoDetail: PosconsumoDetail;

  protected actionRadius: number;
  protected additionalParams: string;
  protected colorLegend: string;
  protected isLoading = false;

  private dataLayerListener;

  private posconsumoDetail: PosconsumoDetail;

  private currentAppSubscription: Subscription;
  private locationChangedSubscription: Subscription;
  private focusOnGeometrySubscription: Subscription;
  private aditionalParamsChangeSubscription: Subscription;
  private resetFusionLayerSubscription: Subscription;
  private deleteAllMarkersSubscription: Subscription;
  private deleteMarkersByLayerTypeSubscription: Subscription;
  private getGeometriesSubscription: Subscription;
  private getMarkerInfoSubscription: Subscription;
  private estacionDisfrutameGetDetailSubscription: Subscription;
  private postConsumoGetDetailSubscription: Subscription;

  // encicla
  markersEncicla = [];
  @Input()
  protected layer: GeoLayer;

  @Input()
  private fixedActionRadius?: number;

  static emitActionRadiusChange(actionRadius: number): void {
      FusionLayerComponent.actionRadiusChange.next(actionRadius);
  }

  static emitLocationChange(latLng: { lat: number; lng: number }): void {
      FusionLayerComponent.locationChange.next(latLng);
  }

  static emitFocusOnGeometry(id: number): void {
      FusionLayerComponent.focusOnGeometry.next(id);
  }

  static emitAdditionalParamsChange(params: string): void {
      FusionLayerComponent.additionalParamsChange.next(params);
  }

  static emitDeleteAllMarkers(): void {
      FusionLayerComponent.deleteAllMarkers.next(''); // Probar vacio
  }

  static emitDeleteMarkersByLayerType(layerType: string): void {
      FusionLayerComponent.deleteMarkersByLayerType.next(layerType);
  }


  constructor(private layerProvider: LayerService,
              private navCtrl: NavController,
              private googleMaps: GooglemapsService,
              private mapProvider: MapService,
              private messageProvider: MessageService,
              private estacionDisfrutameProvider: EstacionDisfrutameService,
              private modalCtrl: ModalController,
              private popoverCtrl: PopoverController,
              private posconsumoMidemeProvider: PosconsumoMidemeService,
              private posiblesViajesProvider: PosiblesViajesService) {
    super();
  }

  ngOnInit() {
    if (this.fixedActionRadius) {this.actionRadius = this.fixedActionRadius; }

    this.currentAppSubscription = this.layerProvider.currentAppChange$.subscribe(
        (app: AppLayer) => {
            this.app = app;

            this.common.capas = app.children;
            if (
              this.layer.layerType === 'BUSQUEDA' ||
              this.layer.layerType === 'MIS PUBLICACIONES') {
              this.actionRadius = Number.MAX_VALUE;
            } else {
                if (
                    this.layer.layerType === 'MAPA DE INVENTARIO DE FLORA'
                ) {
                    this.actionRadius = 50;
                } else {
                    this.actionRadius = app.radius;
                }
            }
            if (this.layer.layerType === 'AVISTAMIENTO' ||
                this.layer.layerType === 'MAPA DE INVENTARIO DE FLORA' ||
                this.layer.layerType === 'MAPA DE AIRE' ||
                this.layer.layerType === 'MAPA DE AGUA') {
                if (this.layer.visible) {
                      this.loadIntoMap();
                  }
              } else {this.setMarkersVisibleByRadius(); }
      });
    this.locationChangedSubscription = FusionLayerComponent.locationChanged$.subscribe(
    (latLng: { lat: number; lng: number }) => {
        FusionLayerComponent.currentLat = latLng.lat;
        FusionLayerComponent.currentLng = latLng.lng;
        if (
            this.layer.layerType === 'AVISTAMIENTO' ||
            this.layer.layerType === 'MIS PUBLICACIONES' ||
            this.layer.layerType === 'MAPA DE INVENTARIO DE FLORA' ||
            this.layer.layerType === 'MAPA DE AIRE' ||
            this.layer.layerType === 'MAPA DE AGUA'
        ) {
            if (this.layer.visible) {this.loadIntoMap(); }
        } else {this.setMarkersVisibleByRadius(); }
    }
    );
    this.focusOnGeometrySubscription = FusionLayerComponent.focusOnGeometry$.subscribe(
    (id: number) => {
        let markerFound = false;
        if (this.layer.markers) {
            console.log('layerMarkers', this.layer.markers);
            const marker: google.maps.Marker = this.layer.markers.find(
                (marker_: google.maps.Marker) => marker_['id'] === id
            );
            // todo: make this marker part of the search layer?

            if (marker) {
                markerFound = true;
                marker.setVisible(true);
                if (FusionLayerComponent.focusedGeometry){
                    FusionLayerComponent.focusedGeometry.setVisible(false);
                }
                FusionLayerComponent.focusedGeometry = marker;
                // marker['alwaysVisible'] = true;
                MapService.map.panTo(marker.getPosition());
                this.getGeometryInfoAndShowInfoWindow(
                    id,
                    marker.getPosition()
                );
            }
        }
        if (!markerFound && this.layer.polygons) {
            const polygon: google.maps.Polygon = this.layer.polygons.find(
                (polygon_: google.maps.Polygon) => polygon_['id'] === id
            );
            if (polygon) {
                const latLng = polygon.getPath().getArray()[0];
                MapService.map.panTo(latLng);
                this.getGeometryInfoAndShowInfoWindow(id, latLng);
            }
        }
      });
    this.aditionalParamsChangeSubscription = FusionLayerComponent.additionalParamsChange$.subscribe(
        (name: string): void => {
            this.additionalParams = name;
        }
    );

    this.deleteAllMarkersSubscription = FusionLayerComponent.deleteAllMarkers$.subscribe(
        foo => {
            if (this.layer.layerType === 'BUSQUEDA' && this.layer.markers) {
                this.layer.markers.forEach((marker: google.maps.Marker) => {
                    marker.setMap(null);
                });
            }
        });

    this.deleteMarkersByLayerTypeSubscription = FusionLayerComponent.deleteMarkersByLayerType$.subscribe(
        layerType => {
            if (this.layer.layerType === layerType && this.layer.markers) {
                this.layer.markers.forEach((marker: google.maps.Marker) => {
                    marker.setMap(null);
                });
            }
        }
        );

    this.resetFusionLayerSubscription = LayerService.resetFusionLayer$.subscribe(
        () => {
            // this.layer.selected = false;
        });
  }

  ngOnDestroy(): void {
    this.layer.selected = false;
    if (this.dataLayerListener) {
      // MapProvider.map.data.removeListener(this.dataLayerListener);
      this.dataLayerListener = undefined;
    }
    this.currentAppSubscription.unsubscribe();
    this.locationChangedSubscription.unsubscribe();
    this.focusOnGeometrySubscription.unsubscribe();
    this.aditionalParamsChangeSubscription.unsubscribe();
    this.deleteAllMarkersSubscription.unsubscribe();
    this.deleteMarkersByLayerTypeSubscription.unsubscribe();
    if (this.resetFusionLayerSubscription){
        this.resetFusionLayerSubscription.unsubscribe(); }
    if (this.getGeometriesSubscription){
        this.getGeometriesSubscription.unsubscribe(); }
    if (this.getMarkerInfoSubscription){
        this.getMarkerInfoSubscription.unsubscribe(); }
    if (this.estacionDisfrutameGetDetailSubscription){
        this.estacionDisfrutameGetDetailSubscription.unsubscribe(); }
    if (this.postConsumoGetDetailSubscription){
        this.postConsumoGetDetailSubscription.unsubscribe(); }
    if (FusionLayerComponent.currentInfoWindow){
        FusionLayerComponent.currentInfoWindow.close(); }
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
            return '#22d8c0';
    }
  }

  getGeometryInfoAndShowInfoWindow(id: number, latLng: any): void {
    console.log('el layer', this.layer);
    console.log('el layerlevel', this.layerLevel);
    console.log('el layertype', this.layer.layerType);

    this.getMarkerInfoSubscription = this.layerProvider
        .getMarkerInfo(id)
        .subscribe(
            response => {
                console.log(
                    FusionLayerComponent.name +
                        ' getGeometryInfoAndShowInfoWindow getMarkerInfo ' +
                        JSON.stringify(response)
                );
                this.showInfoWindow(response, latLng);
            },
            (error: any) =>
                console.log(
                    FusionLayerComponent.name +
                        ' getGeometryInfoAndShowInfoWindow getMarkerInfo error ' +
                        JSON.stringify(error)
                )
        );
  }

  loadIntoMap(): void {
      this.isLoading = true;
      this.getGeometriesSubscription = this.layerProvider
          .getGeometries(this.layer.layerType, {
              layerLevel: this.layerLevel,
              layerId: this.layer.id,
              lat: FusionLayerComponent.currentLat,
              lng: FusionLayerComponent.currentLng,
              actionRadius: this.actionRadius,
              name: this.additionalParams
          })
          .subscribe(
              response => {
                  console.log('layertype', this.layer.layerType);
                  console.log('radio', this.actionRadius);
                  console.log(
                      FusionLayerComponent.name +
                          ' loadIntoMap getGeometries ' +
                          JSON.stringify(response)
                  );
                  if (
                      this.layer.layerType === 'AVISTAMIENTO' ||
                      this.layer.layerType === 'MIS PUBLICACIONES' ||
                      this.layer.layerType === 'MAPA DE AIRE' ||
                      this.layer.layerType === 'MAPA DE AGUA' ||
                      this.layer.layerType === 'MAPA DE INVENTARIO DE FLORA'
                  )
                      {this.multipleTimesLoad(response); }
                  else {this.oneTimeLoad(response); }
                  this.isLoading = false;
                  this.setVisible(true);
              },
              (error: any) => {
                  console.log(
                      FusionLayerComponent.name +
                          ' loadIntoMap getGeometries error ' +
                          JSON.stringify(error)
                  );
                  this.isLoading = false;
              }
          );
  }

  oneTimeLoad(response: any): void {
    const jsonResponse = response;
    // const jsonResponse = JSON.parse(JSON.stringify(response)).json();
    // let color: string = this.getLegendColor();
    this.colorLegend = jsonResponse.colorPoligono;
    const color: string = jsonResponse.colorPoligono;
    const pintarSoloBorde: boolean = jsonResponse.pintarSoloBorde;
    console.log('Se pintará solo borde?');
    console.log(jsonResponse.pintarSoloBorde);
    console.log(pintarSoloBorde);
    // color = '#96c93d'; //Color verde
    if (jsonResponse.markersPoint) {
        // if (this.layer.layerType != 'MAPA DE CLIMA') { // Capa != Clima, se crean los marcadores
        this.layer.markers = jsonResponse.markersPoint.map((item: any) => {
            const marker: google.maps.Marker = this.apiMarkerToGoogleMarker(
                item
            );
            marker.setMap(MapService.map);
            return marker;
        });
    }
    if (jsonResponse.markersPolygon) {
        this.layer.polygons = jsonResponse.markersPolygon.map((item: any) =>
            this.apiPolygonToGooglePolygon(item, color, pintarSoloBorde)
        );
    }

    // Jeferson Salazar -> Se incluye ajuste para renderizar respuesta de encicla
    if (jsonResponse.estaciones) {
        console.log('trajo estaciones');
        // this.onClickEncicla(jsonResponse.estaciones);
    }

    if (jsonResponse.ciclovias) {
        console.log('trajo ciclovias');
    }
  }


  multipleTimesLoad(response: any): void {
      const x = response;
      const newMarkers: google.maps.Marker[] = response
          .markersPoint.map((item: any) =>
              this.apiMarkerToGoogleMarker(item)
            );
      const oldMarkers: google.maps.Marker[] = this.layer.markers || [];
      this.layer.markers = new Array<google.maps.Marker>();
      newMarkers.forEach((newMarker: google.maps.Marker): void => {
          const intersectionMarkerIndex: number = oldMarkers.findIndex(
              (oldMarker: google.maps.Marker): boolean => {
                  return (
                      newMarker['id'] === oldMarker['id'] &&
                      newMarker.getIcon().valueOf()['url'] ===
                          oldMarker.getIcon().valueOf()['url']
                  ); // ensure that markers with icon change are reloaded
              }
          );
          if (intersectionMarkerIndex !== -1) {
              this.layer.markers.push(oldMarkers[intersectionMarkerIndex]);
              oldMarkers.splice(intersectionMarkerIndex, 1);
          } else {
              newMarker.setMap(MapService.map);
              this.layer.markers.push(newMarker);
          }
      });
      oldMarkers.forEach((marker: google.maps.Marker): void =>
          marker.setMap(null)
      );
  }

  setVisible(visible: boolean): void {
      console.log('setVisible ' + visible);
      if (this.layer.markers !== undefined) {
          if (visible) {this.setMarkersVisibleByRadius(); }
          else {
              this.layer.markers.forEach((marker: google.maps.Marker) =>
                  marker.setVisible(false)
              );
              if (FusionLayerComponent.focusedGeometry) {
                  FusionLayerComponent.focusedGeometry.setVisible(true); }
          }
      }
      if (this.layer.polylines !== undefined) {
          this.layer.polylines.forEach((polyline: google.maps.Polyline) =>
              polyline.setVisible(visible)
          );
      }
      if (this.layer.polygons !== undefined) {
          this.layer.polygons.forEach((polygon: google.maps.Polygon) =>
              polygon.setVisible(visible)
          );
      }
  }

  setMarkersVisibleByRadius(): void {
    if (
        this.layer.markers !== undefined &&
        this.layer.visible &&
        FusionLayerComponent.currentLat !== -1 &&
        FusionLayerComponent.currentLng !== -1
    ) {
        const originLatLng: google.maps.LatLng = new google.maps.LatLng(
            FusionLayerComponent.currentLat,
            FusionLayerComponent.currentLng
        );
        this.layer.markers.forEach((marker: google.maps.Marker) => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                originLatLng,
                marker.getPosition()
            );
            // TODO: verify if we have a fixed action radius
            marker.setVisible(distance <= this.actionRadius);
        });
        if (FusionLayerComponent.focusedGeometry) {
            FusionLayerComponent.focusedGeometry.setVisible(true);
        }
    }
  }

  getStationInfoAndShowInfoWindow(id: number, latLng: any): void {
    console.log('Marker id ', id);
    let data;
    let icono;
    let   estado;
    let   nombreEstacion;
    let   subcuencaEstacion;
    let   descripcion;
    let   nivel;
    let   significado;
    let nombreStr; let nombre; let subcuenca;

    this.estacionDisfrutameGetDetailSubscription = this.estacionDisfrutameProvider
        .getDetail(id)
        .subscribe(
            (response: any) => {
                console.log('getMarkerInfo222 ' + JSON.stringify(response));

                data = JSON.stringify(response);
                response.forEach(element => {
                    const key = Object.keys(element);

                    if (key[0] === 'icono') {icono = element[key[0]]; }
                    else if (key[0] === 'estado') {estado = element[key[0]]; }
                    else if (key[0] === 'nombre'){
                        nombreEstacion = element[key[0]]; }
                    else if (key[0] === 'subcuenca'){
                        subcuencaEstacion = element[key[0]]; }
                    else if (key[0] === 'descripcionAire'){
                        descripcion = element[key[0]]; }
                    else if (key[0] === 'descripcion'){
                        nivel = element[key[0]]; }
                    else if (key[0] === 'significado'){
                        significado = element[key[0]]; }
                });

                // Parseo nombre de la Estación
                nombreStr = nombreEstacion.split('. ');
                nombre = nombreStr[nombreStr.length - 1];
                nombre = nombre.replace(' - Nivel', '');
                nombre = nombre.replace(' - ', ', ');

                subcuenca = subcuencaEstacion.replace('Q. ', 'Quebrada ');
                subcuenca = subcuenca.replace('Q ', 'Quebrada ');

                const info = {
                    icono,
                    estado,
                    nombre,
                    subcuenca,
                    descripcion,
                    nivel,
                    significado
                };

                this.showInfoWindowByStation(info, latLng);
            },
            (error: any) =>
                console.log('getMarkerInfo error ' + JSON.stringify(error))
        );
  }

  showInfoWindow(info: any, latLng: any): void {
        console.log('informacion del marcador', info);

        /* 29/07/2019 from google.maps.data.Polygon to google.maps.Polygon change 7
        *if (this.layer.dataFeatures.length > 0) {
            info.ir = false;
        }*/
        if (this.layer.polygons && this.layer.polygons.length > 0) {
            info.ir = false;
        } else {
            info.ir = true;
        }
        let posicion1: number;
        let posicion2: number;
        let idDocument = '';
        let idImagen = '';
        let imagen: string;
        if (info.rutaImagen != null) {
            if (info.rutaImagen.length > 2 && info.rutaImagen !== ' ') {
                for (let index = 0; index < info.rutaImagen.length; index++) {
                    const element = info.rutaImagen[index];
                    if (element === 'd' && info.rutaImagen[index + 1] === '/') {
                        posicion1 = index + 2;
                    }
                    if (
                        element === '/' &&
                        info.rutaImagen[index - 1] !== '/' &&
                        info.rutaImagen[index + 1] === 'v'
                    ) {
                        posicion2 = index - 1;
                    }
                }

                for (let index = 0; index < info.rutaImagen.length; index++) {
                    const element = info.rutaImagen[index];
                    if (index >= posicion1 && index <= posicion2) {
                        idDocument = idDocument + element;
                    }
                }
                if (idDocument !== '') {
                    idImagen = `https://drive.google.com/uc?export=view&id=${idDocument}`;
                    info.rutaImagen = idImagen;
                    imagen = idImagen;
                } else {
                    imagen = info.rutaImagen;
                }
            } else {
                imagen = info.rutaImagen;
            }
        } else {
            if (info.rutaImagen == null) {
                imagen = this.layer.urlIcon;
            } else {
                imagen = info.rutaImagen;
            }
        }
        let posicion11: number;
        let posicion22: number;
        let idDocument2 = '';
        let idImagen2 = '';
        if (info.rutaImagen2 != null) {
            if (info.rutaImagen2.length > 2 && info.rutaImagen2 !== ' ') {
                for (let index = 0; index < info.rutaImagen2.length; index++) {
                    const element = info.rutaImagen2[index];
                    if (element === 'd' && info.rutaImagen2[index + 1] === '/') {
                        posicion11 = index + 2;
                    }
                    if (
                        element === '/' &&
                        info.rutaImagen2[index - 1] !== '/' &&
                        info.rutaImagen2[index + 1] === 'v'
                    ) {
                        posicion22 = index - 1;
                    }
                }
                for (let index = 0; index < info.rutaImagen2.length; index++) {
                    const element = info.rutaImagen2[index];
                    if (index >= posicion11 && index <= posicion22) {
                        idDocument2 = idDocument2 + element;
                    }
                }
                if (idDocument2 !== '') {
                    idImagen2 = `https://drive.google.com/uc?export=view&id=${idDocument}`;
                    info.rutaImagen2 = idImagen2;
                }
            }
        }

        const contentString = `
                <style>
                    .gm-style-iw {
                        height: 70px !important;
                        width:100%!important;
                        max-width:100%!important;
                        max-height:70px!important;
                        min-height: 86px !important;
                    }
                    .gm-style .gm-style-iw-c {
                        background-color:transparent!important;
                        box-shadow:none!important;
                        overflow: visible!important;
                    }
                    .gm-style .gm-style-iw {
                        display: contents!important;
                    }
                    .gm-ui-hover-effect {
                        opacity: 0!important;
                        display:none!important;
                    }
                    .custom-iw, .custom-iw>div:first-child>div:last-child {
                        width: calc(100vw - 40px) !important;
                    }
                    .gm-style div div div div {
                        max-width: calc(100vw - 40px) !important;
                    }
                    .gm-style .gm-style-iw-d {
                        height:0;
                    }
                    .gm-style .gm-style-iw-t::after, .gm-style-iw-t::before {
                        border:none;
                    }
                    #div-main-infoWindow {
                        overflow: visible !important;
                        width: calc(100vw - 40px)!important;
                    }
                    .boton_personalizado {
                        text-decoration: none!important;
                        max-height: 4rem!important;
                        padding: 0.8rem!important;
                        background-color: transparent!important;
                        border-radius: 6px!important;
                        width: 20%!important;
                        margin: 0 auto!important;
                        display:none!important;
                    }
                    .gm-style .box-card {
                        border-radius:6px!important;
                        margin: 0px!important;
                        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)!important;
                        max-width: 100%!important;
                        width: 100%!important;
                        min-height: 70px!important;
                        display: flex!important;
                        position: absolute!important;
                        bottom: 30px!important;
                        left: -50%!important;
                    }
                    .content-ios .gm-style .box-card {

                    }
                    .gm-style .box-card .icon-container img{
                        width: 70px!important;
                        height:70px!important;
                        border-radius:6px!important;
                        display: flex!important;
                        justify-content: space-around!important;
                        align-items: center!important;
                    }
                    .gm-style .box-card .description {
                        display: flex!important;
                        justify-content: center!important;
                        align-items: flex-start!important;
                        flex-direction: column!important;
                        flex-grow: 1!important;
                        flex-basis: 0!important;
                        padding: 3px 20px 3px 5px!important;
                        color: #ffffff!important;
                        width:calc(100% - 70px)!important;
                    }
                    .gm-style .box-card .description .name {
                        font-weight: bold!important;
                        font-size: 1.7rem!important;
                        overflow: hidden!important;
                        max-width: 100%!important;
                        word-break: break-word;
                    }
                    .gm-style .box-card .description .infoGeneral {
                        font-size: 1.3rem!important;
                        font-weight: normal!important;
                        overflow: hidden!important;
                        text-overflow: ellipsis!important;
                        white-space: nowrap!important;
                        margin: 0!important;
                        max-width: 100%!important;
                    }
                    .punta {
                        width: 0!important;
                        height: 0!important;
                        margin-left:-15px!important;
                        border-style: solid!important;
                        border-width: 15px 15px 0 15px!important;
                        position: inherit!important;
                        bottom: -14px!important;
                        left: 50%;
                    }
                    ion-icon.gas {
                        position: absolute;
                        right: 0px;
                        top: 0px;
                        width: 20px;
                        font-size: 2.5em;
                        color: white;
                        font-weight: bold;
                        border-radius: 6px 6px 0 0;
                    }

                    #infoWindowButtonRoutes {
                        display: flex!important;
                    }
                </style>

                <div class="box-card"  style="background-color: ${this.color}">
                    <div id="infoWindowButtonRoutes" >
                        <div class="icon-container">
                            <img src="${imagen}" style="background: white;">
                        </div>
                        <div class="description">
                            <div class="name">
                            ${info.nombre}
                            </div>
                            <span class="infoGeneral">${info.direccion}<span *ngIf="info.direccion && info.nombreMunicipio"> </span>${info.nombreMunicipio}</span>
                        </div>
                    </div>
                    <div class="punta" style="border-color: ${this.color} transparent transparent transparent!important;"></div>
                    <ion-icon id="gdj2" name="close" role="img" class="icon icon-ios ion-ios-close gas" aria-label="close"></ion-icon>
                </div>`;
        if (FusionLayerComponent.currentInfoWindow) {
            FusionLayerComponent.currentInfoWindow.close();
        }

        FusionLayerComponent.currentInfoWindow = new google.maps.InfoWindow({
            content: contentString
        });
        FusionLayerComponent.currentInfoWindow.setPosition(latLng);
        FusionLayerComponent.currentInfoWindow.open(MapService.map);
        FusionLayerComponent.currentInfoWindow.addListener(
            'domready',
            (args: any[]): void => {
                document
                    .getElementById('infoWindowButtonRoutes')
                    .addEventListener('click', () => {
                        FusionLayerComponent.currentInfoWindow.close();
  // No implementado aún muévete!
                        // this.posiblesViajesProvider.origen.lat =
                        //     FusionLayerComponent.currentLat;
                        // this.posiblesViajesProvider.origen.lon =
                        //     FusionLayerComponent.currentLng;
                        // this.posiblesViajesProvider.origen.descripcion =
                        //     "Mi ubicación";
                        // this.posiblesViajesProvider.destino.lat = latLng.lat();
                        // this.posiblesViajesProvider.destino.lon = latLng.lng();
                        // this.posiblesViajesProvider.destino.descripcion =
                        //     info.descripcion;
                        // this.common
                        //     .createModal(TerritorioDetailComponent, {
                        //         info,
                        //         nombreCapa: this.layer.name,
                        //         iconoCapa: this.layer.urlIcon
                        //     })
                        //     .present();
                        this.getModalTerritorioDetail(info, this.layer.name, this.layer.urlIcon);
                    });
                document
                    .getElementById('gdj2')
                    .addEventListener('click', () => {
                        FusionLayerComponent.currentInfoWindow.close();
                    });
            }
        );

        MapService.map.panTo(latLng);
  }

  async getModalTerritorioDetail( info, nombreCapa, iconoCapa ) {
    const modal = await this.modalCtrl.create({
        component: TerritorioDetailComponent,
        componentProps: {
          info,
          nombreCapa,
          iconoCapa
        }
    });
    await modal.present();
  }

  async getModalCuidameDetail( markerId, color, from ) {
    const modal = await this.modalCtrl.create({
        component: CuidameDetailComponent,
        componentProps: {
          markerID: markerId,
          color,
          fromComponent: from
        }
    });
    await modal.present();
  }


  // : google.maps.Marker
  // Validar creación de modal y ventana  de navegación con routing
  apiMarkerToGoogleMarker(json: any) {
    console.log(json.rutaWebIcono);
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
    console.log(marker);
    console.log(
        'Level ' +
            this.layerLevel +
            '  Id  ' +
            this.layer.id +
            ' Name ' +
            this.layer.name
    );
    marker['id'] = json.idMarker;
    console.log(json);
    console.log(json.idMarker);
    marker.addListener('click', (args: any = {}) => {
        this.layerProvider.currentAppChange$.subscribe((app: AppLayer) => {
            this.app = app;
        });
        if (
            this.layerLevel === 'CAPA' &&
            this.layer.layerType === 'MAPA DE CLIMA'
        ) {
            // Clima
            console.log('Clima');
            this.getModalClimaDetalle(  json.idMarker, this.color);
        } else if (
            this.layerLevel === 'CAPA' &&
            this.layer.layerType === 'MAPA DE AIRE'
        ) {
            // Aire
            console.log('Aire');
            this.getModalDetalleEstacion(
                marker['id'], this.layer.name, this.layer.id
            );
        } else if (
            this.layerLevel === 'CAPA' &&
            this.layer.layerType === 'MAPA DE AGUA'
        ) {
            // Agua
            console.log('Agua');
            this.getStationInfoAndShowInfoWindow(marker['id'], args.latLng);
        } else if (
            this.layerLevel === 'CATEGORIA' &&
            this.app.id === APPS.HUELLAS
        ) {
            // Posconsumo
            this.getPlaceInfoAndShowInfoWindow(
                marker["id"],
                args.latLng,
                this.layer.name
            );
        }else if (this.layerLevel === 'CAPA' &&
                    this.app.id === APPS.VIGIAS) {
            this.getModalCuidameDetail(marker['id'],
                this.color,
                'marker');
        } else {
            this.getGeometryInfoAndShowInfoWindow(
                marker['id'],
                args.latLng
            );
        }
    });
    return marker;
  }

  getPlaceInfoAndShowInfoWindow(
    id: number,
    latLng: any,
    tipoCentro: string
    ): void {
        this.postConsumoGetDetailSubscription = this.posconsumoMidemeProvider
            .getDetail(id)
            .subscribe(
                (detail: PosconsumoDetail) => {
                    this.posconsumoDetail = detail;
                    console.log('getMarkerInfo ' + this.posconsumoDetail);

                    if (this.posconsumoDetail) {
                        this.showInfoWindowByPlace(tipoCentro, latLng);
                    } else {
                        console.log('getMarkerInfo no Data');
                    }
                },
                (error: any) =>
                    console.log('getMarkerInfo error ' + JSON.stringify(error))
            );
    }

    async getModalDetallePosConsumo(tipo: string, latLng: any) {
        const modal = await this.modalCtrl.create({
            component: DetallePosconsumoComponent,
            componentProps: {
                info: this.posconsumoDetail,
                color: this.color,
                tipo
            }
        });
        await modal.present();
        await modal.onDidDismiss().then((resp): any => {
            console.log(resp.data.ir);
            if ( resp.data.ir) {
                // FusionLayerComponent.currentInfoWindow.close();
                this.posiblesViajesProvider.origen.lat =
                FusionLayerComponent.currentLat;
                this.posiblesViajesProvider.origen.lon =
                    FusionLayerComponent.currentLng;
                this.posiblesViajesProvider.origen.descripcion =
                    'Mi ubicación';
                this.posiblesViajesProvider.destino.lat = latLng.lat();
                this.posiblesViajesProvider.destino.lon = latLng.lng();
                // this.posiblesViajesProvider.destino.descripcion = info.descripcion;
                this.posiblesViajesProvider.destino.descripcion = this.posconsumoDetail.description;
                const movilidadApp: AppLayer = this.layerProvider
                .getAppsChangeValue()
                .find((app: AppLayer): boolean => {
                    return app.id === 1;
                });
                this.posiblesViajesProvider
                    .obtenerviajesSugeridos(false)
                    .then(data => {
                        data['app'] = movilidadApp;
                        // this.navCtrl.push(VistaViajesPage, data);
                    })
                    .catch(error => {
                        this.common.basicAlert('Movilidad', error);
                    });
            }
        });
    }

    showInfoWindowByPlace(tipo: string, latLng: any): void {
        console.log('color', this.color);
        console.log('informacjon', this.posconsumoDetail);
        console.log('tipo', tipo);
        this.getModalDetallePosConsumo(tipo, latLng);
        MapService.map.panTo(latLng);

    }

  async getModalDetalleEstacion(markerId, nombreCapa, idCapa) {
    const modal = await this.modalCtrl.create({
        component: DetalleEstacionComponent,
        componentProps: {
            markerId,
            nombreCapa,
            idCapa
        }
    });
    await modal.present();
  }

  showInfoWindowByStation(info: any, latLng: any): void {
      const contentString = `
              <style>
                  .gm-style-iw {
                      height: 170px !important;
                      width:100%!important;
                      max-width:100%!important;
                      max-height:170px!important;
                      min-height: 86px !important;
                  }
                  .gm-style .gm-style-iw-c {
                      background-color:transparent!important;
                      box-shadow:none!important;
                      overflow: visible!important;
                  }
                  .gm-style .gm-style-iw {
                      display: contents!important;
                  }
                  .gm-ui-hover-effect {
                      opacity: 0!important;
                      display:none!important;
                  }
                  .custom-iw, .custom-iw>div:first-child>div:last-child {
                      width: calc(100vw - 40px) !important;
                  }
                  .gm-style div div div div {
                      max-width: calc(100vw - 40px) !important;
                  }
                  .gm-style .gm-style-iw-d {
                      height:0;
                  }
                  .gm-style .gm-style-iw-t::after, .gm-style-iw-t::before {
                      border:none;
                  }
                  #div-main-infoWindow {
                      overflow: visible !important;
                      width: calc(100vw - 40px)!important;
                  }
                  .boton_personalizado {
                      text-decoration: none!important;
                      max-height: 4rem!important;
                      padding: 0.8rem!important;
                      background-color: transparent!important;
                      border-radius: 6px!important;
                      width: 20%!important;
                      margin: 0 auto!important;
                      display:none!important;
                  }
                  .gm-style .box-card {
                      border-radius:6px!important;
                      margin: 0px!important;
                      box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)!important;
                      background: #ffffff!important;
                      max-width: 100%!important;
                      width: 100%!important;
                      min-height: 190px!important;
                      position: absolute!important;
                      bottom: 25px!important;
                      left: -50%!important;
                  }
                  .content-ios .gm-style .box-card {

                  }
                  .gm-style .box-card .header {
                      width: 100%!important;
                      height:auto!important;
                      border-radius:6px 6px 0 0!important;
                      color:#ffffff;
                      padding:2px;
                      padding-right: 26px;
                      display:flex;
                      word-break:break-word;
                  }
                  .gm-style .box-card .header img{
                      width: 45px!important;
                      height:45px!important;
                      min-width: 45px!important;
                      min-height: 45px!important;
                      max-width: 45px!important;
                      max-height: 45px!important;
                      margin:auto 0;
                      -webkit-clip-path: circle(14px at center);
                      clip-path: circle(14px at center);
                      vertical-align: middle;
                      margin-right:-5px;
                  }
                  .gm-style .box-card .header span{
                      font-size: 1.7rem;
                      vertical-align: middle;
                      font-weight:500;
                      margin: auto;
                      text-align:center;
                  }
                  .gm-style .box-card .body {
                      display: flex!important;
                      justify-content: center!important;
                      flex-direction: column!important;
                      flex-basis: 0!important;
                      padding: 8px!important;
                      width:100%!important;
                  }
                  .gm-style .box-card .body .name {
                      font-size: 1.5rem!important;
                      overflow: hidden!important;
                      max-width: 100%!important;
                      text-overflow: ellipsis!important;
                      white-space: nowrap!important;
                      text-align:center;
                  }
                  .gm-style .box-card .body .infoGeneral {
                      font-size: 1.3rem!important;
                      color: #333333!important;
                      overflow: hidden!important;
                      text-overflow: ellipsis!important;
                      margin: 0;
                      max-width: 100%!important;
                  }
                  .punta {
                      width: 0!important;
                      height: 0!important;
                      margin-left:-15px!important;
                      border-style: solid!important;
                      border-width: 15px 15px 0 15px!important;
                      border-color: #ffffff transparent transparent transparent!important;
                      position: inherit!important;
                      bottom: -14px!important;
                      left: 50%;
                  }
                  .bold {
                      font-weight:600!important;
                  }
                  .gm-style .buttonsi {
                      display: inline-block;
                      position: absolute;
                      top: 8px;
                      right: 0;
                      color:#fff;
                  }
                  .gm-style .buttonsi .buttoni {
                      background: transparent;
                      color:#fff;
                  }
                  .gm-style .buttonsi .buttoni .button-inner{
                      margin-right:15px;
                  }
                  .significado{
                      margin-bottom: 23px !important;
                      margin-left: 20px !important;
                      margin-right: 20px !important;
                  }
                  .separador{
                      display: flex;
                      justify-content: center;
                  }
                  .separador-hijo{
                      border-style: solid;
                      border-width: 1px;
                      width: 58%;
                  }

              </style>
              <div class="box-card">
                  <div class="header"  style="background-color: ${info.estado}">
                      <img class="icon-header" src="${info.icono}" alt="">
                      <span>${info.descripcion}</span>
                      <div class="buttonsi">
                          <div id="closeInfoWindow" icon-only="" class="buttoni disable-hover bar-button bar-button-ios bar-button-default bar-button-default-ios">
                              <span class="button-inner">
                                  <ion-icon name="close" role="img" class="icon icon-ios ion-ios-close" aria-label="close"></ion-icon>
                              </span>
                              <div class="button-effect"></div>
                          </div>
                      </div>
                  </div>
                  <div class="body">
                      <span class="name bold">Estación:</span>
                      <span class="name">${info.nombre}</span>
                      <hr style="width: 80%; background-color: darkgray">
                      <br>
                      <span class="infoGeneral bold">Subcuenca:</span>
                      <span class="infoGeneral">${info.subcuenca}</span>
                      <br>
                      <span class="infoGeneral bold" style="margin-bottom: -10px">${info.nivel}</span>
                      <br>
                      <span class="infoGeneral significado">${info.significado}</span>
                  </div>
                  <div class="punta"></div>
              </div>`;

      if (FusionLayerComponent.currentInfoWindow) {
          FusionLayerComponent.currentInfoWindow.close();
      }

      FusionLayerComponent.currentInfoWindow = new google.maps.InfoWindow({
          content: contentString
      });
      FusionLayerComponent.currentInfoWindow.setPosition(latLng);
      FusionLayerComponent.currentInfoWindow.open(MapService.map);
      FusionLayerComponent.currentInfoWindow.addListener(
          'domready',
          (args: any[]): void => {
              document
                  .getElementById('closeInfoWindow')
                  .addEventListener('click', () => {
                      FusionLayerComponent.currentInfoWindow.close();
                  });
          }
      );

      MapService.map.panTo(latLng);
  }

  apiPolygonToGooglePolygon(
    json: any,
    color: string,
    pintarSoloBorde: boolean
): google.maps.Polygon {
    const paths: google.maps.LatLng[][] = [];
    json.encodedPolygon.forEach(element => {
        const decoded: google.maps.LatLng[] = google.maps.geometry.encoding.decodePath(
            element
        );
        paths.push(decoded);
    });
    // let decoded = google.maps.geometry.encoding.decodePath(json.encodedPolygon);
    // paths = decoded.map(item => {
    //     return { lat: item.lat(), lng: item.lng() };
    // });
    const polygon = new google.maps.Polygon({
        paths,
        map: MapService.map,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: color,
        fillOpacity: pintarSoloBorde ? 0.0 : 0.35,
        clickable: true,
        visible: true,
        zIndex: 100
    });
    polygon['id'] = json.id;
    polygon.addListener('click', (args: any = {}) => {
        const x = this.layer.polygons;
        if (
          this.layerLevel === 'CAPA' &&
          this.layer.layerType === 'MAPA DE CLIMA'
        ) {
            // Clima
            // this.navCtrl.push(ClimaDetalleComponent, {
            //     polygonId: polygon['id'],
            //     color: this.color
            // });
            this.getModalClimaDetalle(json.id, this.color);
        } else {
            this.getGeometryInfoAndShowInfoWindow(
                json.id,
              args.latLng
            );
        }
    });
    return polygon;
  }

  async getModalClimaDetalle(polygonId, color) {
    const modal = await this.modalCtrl.create({
        component: ClimaDetalleComponent,
        componentProps: {
            polygonId,
            color
        }
    });
    await modal.present();
  }

  /**  29/07/2019 from google.maps.data.Polygon to google.maps.Polygon change 6 */
  apiPolygonToGooglePolygon_(json: any): google.maps.Data.Polygon {
      const paths: google.maps.LatLng[][] = [];
      json.encodedPolygon.forEach(element => {
          const decoded: google.maps.LatLng[] = google.maps.geometry.encoding.decodePath(
              element
          );
          paths.push(decoded);
      });

      const polygon: google.maps.Data.Polygon =
            new google.maps.Data.Polygon(paths);
    //   MapProvider.map.data.add()
      polygon['id'] = json.id;
      google.maps.event.addListener(polygon, 'click', (args: any) => {
        const x = args;
    });
      return polygon;
  }

  onTapLayer(): void {
    this.cleanOtherLayers();
    this.layer.selected = !this.layer.selected;

    if (this.layer.visible) {
        this.setVisible(false);
        this.layer.visible = false;
        if (FusionLayerComponent.currentInfoWindow){
            FusionLayerComponent.currentInfoWindow.close();
        }
        // console.log('activeLayers ' + JSON.stringify(this.common.activeLayers));
        this.common.activeLayers.ids = this.common.activeLayers.ids.filter(
            id => id !== this.layer.id
        );
        // console.log('activeLayers after filter ' + JSON.stringify(this.common.activeLayers));
    } else {
        /* 29/07/2019 from google.maps.data.Polygon to google.maps.Polygon change 2
        *if (this.layer.markers == undefined
            && this.layer.polylines == undefined
            && this.layer.dataFeatures == undefined) {*/
        if (
            this.layer.markers === undefined &&
            this.layer.polylines === undefined &&
            this.layer.polygons === undefined
        ) {
            this.layer.visible = true;
            this.loadIntoMap();
            this.common.activeLayers.level = this.layerLevel;
            this.common.activeLayers.ids.push(this.layer.id);
        } else {
            this.setGeometriesMap();
            this.layer.visible = true;
            this.setVisible(true);
            this.common.activeLayers.ids.push(this.layer.id);
        }
    }
  }

  setGeometriesMap(): void {
    if (this.layer.markers){
        this.layer.markers.forEach((marker: google.maps.Marker): void =>
            marker.setMap(MapService.map)
        );
    }
    if (this.layer.polygons) {
        this.layer.polygons.forEach((polygon: google.maps.Polygon): void =>
            polygon.setMap(MapService.map)
        );
    }
  }

  cleanOtherLayers(): void {
    const idsThatCleanOtherLayers: number[] = [
        185, // Avistamientos - Buscador
        5 // Avistamientos - Mis avistamientos
        // 10, //Mi Entorno - Calidad del aire
        // 11, //Mi Entorno - Monitoreo hídrico
        // 12, //Mi Entorno - Clima
        // 13 //Mi Entorno - Suelos
    ];
    const layerToClearId: number = idsThatCleanOtherLayers.find(
        (element: number): boolean => {
            return element === this.layer.id;
        }
    );
    if (
        this.layerLevel === 'CAPA' &&
        layerToClearId &&
        !this.layer.visible
    ) {
        // emit to clean all other layers
        this.tapLayer.emit(this.layer);
    }
  }

  defaultFeatureProperties() {
    return {
        visible: false
    };
  }

  testStyle(): google.maps.Data.StyleOptions {
    return {
        // fillOpacity: 0,
        strokeOpacity: 0,
        strokeWeight: 1
    };
  }

  dataPolygonStyleOptions(
    color: string,
    pintarSoloBorde: boolean
  ): google.maps.Data.StyleOptions {
    const styleOptions: google.maps.Data.StyleOptions = {
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: color,
        fillOpacity: pintarSoloBorde ? 0.0 : 0.35 // Si el layer es Clima
    };
    return styleOptions;
  }

  getColorSelectedLayer(): string {
    return this.layer.visible ? this.color : null;
  }

  public layerActive(): string {
      if (this.layer.selected) {
        return this.color;
      } else {
        return 'transparent';
      }
  }

  public isLayerActive(): string {
    return this.layer.selected ? 'layer-active' : 'layer-unactive';
  }

}
