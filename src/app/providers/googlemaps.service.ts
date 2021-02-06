import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Common } from '../shared/utilidades/common.service';
import { Events } from './events.service';

@Injectable({
  providedIn: 'root'
})
export class GooglemapsService {

  private markersToAdd = new Subject<google.maps.Marker[]>();
    private markersToRemove = new Subject<google.maps.Marker[]>();
    private polylinesToAdd = new Subject<google.maps.Polyline[]>();
    private polylinesToRemove = new Subject<google.maps.Polyline[]>();
    private polygonsToAdd = new Subject<google.maps.Polygon[]>();
    private polygonsToRemove = new Subject<google.maps.Polygon[]>();

    markersToAdd$ = this.markersToAdd.asObservable();
    markersToRemove$ = this.markersToRemove.asObservable();
    polylinesToAdd$ = this.polylinesToAdd.asObservable();
    polylinesToRemove$ = this.polygonsToRemove.asObservable();
    polygonsToAdd$ = this.polygonsToAdd.asObservable();
    polygonsToRemove$ = this.polygonsToRemove.asObservable();

    private adjustMap = new Subject<any>();
    private focusOnPosition = new Subject<any>();

    private kmlsToAdd = new Subject<any>();
    private kmlsToRemove = new Subject<any>();

    private pintarMarkersSub = new Subject<any>();
    private quitarMarkersSub = new Subject<any>();
    private miPuntoSub = new Subject<any>();
    private volverAPuntoSub = new Subject<any>();
    private cambiarZoomSub = new Subject<any>();
    private pintarMarkerSub = new Subject<any>();
    private renderPointSub = new Subject<any>();
    private agregarKmlSub = new Subject<any>();
    private quitarKmlSub = new Subject<any>();
    private crearInfoWindowSub = new Subject<any>();
    private agregarListaPoligonoSub = new Subject<any>();
    private quitarListaPoligonoSub = new Subject<any>();
    private initMapSub = new Subject<any>();
    private rmMapSub = new Subject<any>();
    private cambiarRadioAccionSub = new Subject<any>();
    public ListaMarcadores = {};
    public puntosPoligonos = [];
    public posicionLat: any;
    public posicionLon: any;
    private zoomChange = new Subject<any>();
    private locationChange = new Subject<any>();
    private actionRadiusChange = new Subject<any>();
    private geometrySelectedChange = new Subject<any>();
    private typeaheadLocationChange = new Subject<any>();
    private unsubscribeFromLocationChanges = new Subject<any>();
    private preferencesChange = new Subject<any>();

    zoomChanged$ = this.zoomChange.asObservable();
    locationChanged$ = this.locationChange.asObservable();
    actionRadiusChanged$ = this.actionRadiusChange.asObservable();
    geometrySelectionChanged$ = this.geometrySelectedChange.asObservable();
    typeaheadLocationChanged$ = this.typeaheadLocationChange.asObservable();
    unsubscribeFromLocationChanges$ = this.unsubscribeFromLocationChanges.asObservable();
    preferencesChanged$ = this.preferencesChange.asObservable();

    pintarMarkers$ = this.pintarMarkersSub.asObservable();
    quitarMarkers$ = this.quitarMarkersSub.asObservable();
    miPuntoSub$ = this.miPuntoSub.asObservable();
    volverAPunto$ = this.volverAPuntoSub.asObservable();
    cambiarZoom$ = this.cambiarZoomSub.asObservable();
    pintarMarker$ = this.pintarMarkerSub.asObservable();
    renderPoint$ = this.renderPointSub.asObservable();


    adjustMap$ = this.adjustMap.asObservable();
    focusOnPosition$ = this.focusOnPosition.asObservable();

    kmlsToAdd$ = this.kmlsToAdd.asObservable();
    kmlsToRemove$ = this.kmlsToRemove.asObservable();
    agregarKml$ = this.agregarKmlSub.asObservable();
    quitarKml$ = this.quitarKmlSub.asObservable();
    crearInfoWindow$ = this.crearInfoWindowSub.asObservable();
    agregarListaPoligono$ = this.agregarListaPoligonoSub.asObservable();
    quitarListaPoligono$ = this.quitarListaPoligonoSub.asObservable();
    initMap$ = this.initMapSub.asObservable();
    cambiarRadioAccion$ = this.cambiarRadioAccionSub.asObservable();
    removerMapa$ = this.rmMapSub.asObservable();

    emitZoomChange(zoom: number) { this.zoomChange.next(zoom); }

    emitLocationChange(latLng: { lat: number, lng: number }) { this.locationChange.next(latLng); }

    emitActionRadiusChange(actionRadius: number) { this.actionRadiusChange.next(actionRadius); }

    emitGeometrySelectionChange(id: number) { this.geometrySelectedChange.next(id); }

    emitUnsubscribeFromLocationChanges() { this.unsubscribeFromLocationChanges.next(); }

    emitTypeaheadLocationChange(latLng: { lat: number, lng: number }) { this.typeaheadLocationChange.next(latLng); }

    emitPreferencesChange() { this.preferencesChange.next(); }

  constructor(private events: Events,
              private utilidad: Common) {
    // this.infowindow = new google.maps.InfoWindow();
    // this.events.subscribe('changeGeolocation', (latitud: number, longitud: number) => {
    //   if (this.puntosPoligonos.length > 0) {
    //     this.puntosPoligonos.forEach(item => {
    //       // item.lat
    //       const pos: any = {
    //         lat: latitud,
    //         lng: longitud
    //       };
    //       const resultado = google.maps.geometry.poly.containsLocation(pos, item.poligono) ? true : false;
    //       if (resultado) {
    //         if (item.desplegado) {
    //           item.desplegado = false;
    //         }
    //       }
    //       else if (!resultado && !item.desplegado) {
    //         if (!item.desplegado) {
    //           item.desplegado = true;
    //           utilidad.generalAlert(item.titulo, 'Haz salido de ' + item.nombre);
    //         }
    //       }


    //     });
    //   }
    // });
  }


  updateMarkersToAdd(markersToAdd: any): void {
    this.markersToAdd.next(markersToAdd);
  }

  updateMarkersToRemove(markersToRemove: any): void {
    this.markersToRemove.next(markersToRemove);
  }

  updateKmlsToAdd(kmlsToAdd: any): void {
    this.kmlsToAdd.next(kmlsToAdd);
  }

  updateKmlsToRemove(kmlsToRemove: any): void {
    this.kmlsToRemove.next(kmlsToRemove);
  }

  updateAdjustMap(): void {
    this.adjustMap.next({});
  }


  public pintarMarkers(objeto: any): any {
    this.pintarMarkersSub.next(objeto);
  }

  public quitarMarkers(markers: any) {
    this.quitarMarkersSub.next(markers);
  }

  public miPunto(objeto: { lat: any, lng: any, icono: string, animation: google.maps.Animation }): any {
    return this.miPuntoSub.next(objeto);
  }

  public volverAPunto(objeto: { lat: number, long: number }) {
    this.volverAPuntoSub.next(objeto);
  }

  public pintarMarker(objetoMarker: any) {
    this.pintarMarkerSub.next(objetoMarker);
  }

  public cambiarZoom(objLatLong: { lat: number, long: number, zoom: number }) {
    this.cambiarZoomSub.next(objLatLong);
  }

  public renderPoint(objeto: { result: any, polyline: any }) {
    this.renderPointSub.next(objeto);
  }

  public agregarListaPoligono(objeto: any) {
    this.agregarListaPoligonoSub.next(objeto);
  }

  public quitarListaPoligono(objeto: any) {
    this.quitarListaPoligonoSub.next(objeto);
  }

  public initMap(objeto: any) {
    this.initMapSub.next(objeto);
  }

  public cambiarRadioAccion(km: number) {
    this.cambiarRadioAccionSub.next(km);
  }

  public removerMapa() {
    this.rmMapSub.next();
  }

  crearInfoWindow(objeto: { marker: any, contenido: string }) {
    this.crearInfoWindowSub.next(objeto);
  }
}
