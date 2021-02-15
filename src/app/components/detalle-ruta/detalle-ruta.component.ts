import { GmapsMovilidadService } from './../../providers/movilidad/gmaps-movilidad.service';
import { LocationUpdateService } from './../../providers/location-update.service';
import { WsMovilidadService } from './../../providers/movilidad/ws-movilidad.service';
import { Common } from './../../shared/utilidades/common.service';
import { GooglemapsService } from './../../providers/googlemaps.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

declare var google;

@Component({
  selector: 'detalle-ruta',
  templateUrl: './detalle-ruta.component.html',
  styleUrls: ['./detalle-ruta.component.scss'],
})
export class DetalleRutaComponent implements OnInit, OnDestroy, OnChanges {

  @Input() ruta: any;
  @Output() mostrarRuta = new EventEmitter();
  @Input() color: string;

  private DISTANCE_TOLERANCE = 1;
  private LOCATION_UPDATES_INTERVAL = 100;
  private locationUpdateSubscription: Subscription;
  public mostrarDetalle: boolean;
  public iconClass: string;
  public estacionesMetro: any[] = [];
  public markers = [];

  constructor(private googleMaps: GooglemapsService,
              private utilidades: Common,
              public wsMovilidad: WsMovilidadService,
              private locationUpdate: LocationUpdateService,
  ) {
    this.mostrarDetalle = false;
    this.iconClass = 'arrow-dropdown-circle'; }

  ngOnInit() {
    this.turnOnLocationUpdate();
  }

  ngOnChanges(changes: SimpleChanges) {
    const data = changes.ruta.currentValue;
    if (data.idLinea && data.estaciones) {
      this.obtenerEstaciones(data.estaciones);
    }
  }

  ngOnDestroy() {
    if (this.locationUpdateSubscription) {this.locationUpdateSubscription.unsubscribe(); }
  }

  toggleDetalle() {    if (this.mostrarDetalle) {
      this.mostrarDetalle = false;
      this.iconClass = 'arrow-dropdown-circle';
    } else {
      this.mostrarDetalle = true;
      this.iconClass = 'arrow-dropup-circle';
    }
  }

  turnOnLocationUpdate(){
    if (this.locationUpdateSubscription) {return; }

    this.locationUpdateSubscription = this.locationUpdate
    .getObservable(this.DISTANCE_TOLERANCE, this.LOCATION_UPDATES_INTERVAL)
    .subscribe((latLng: { lat: number, lng: number }): void => {

    });
}

  checkMostrarRuta(event, ruta) {
    console.log('ruta', ruta);
    if (event.checked) {
      const modoTransporte = GmapsMovilidadService.obtenerModoTransporte(ruta);

      this.pintarExtremos(ruta, 'assets/movilidad/markers/markerInicio.svg', 'start');
      this.pintarExtremos(ruta, 'assets/movilidad/markers/markerLlegada.svg', 'end');


      if (ruta.idLinea) {
        this.pintarMarkers(ruta.estaciones);
      } else {
        this.pintarMarkers(ruta.paraderos);
      }

      GmapsMovilidadService.mostrarRuta(ruta, modoTransporte);
      ruta.checked = true;
      this.mostrarRuta.emit({ visible: true, markers: this.markers });
    } else {
      GmapsMovilidadService.ocultarRuta(ruta);
      GmapsMovilidadService.ocultarMarkersRuta(ruta);
      ruta.checked = false;
    }
  }

  public pintarExtremos(ruta: any, icono: string, tipo: string){
    let startMarker;
    if (tipo === 'start'){
      startMarker = {
        icono,
        mLat : ruta.primerPunto[0],
        mLng: ruta.primerPunto[1]
      };
    }else if (tipo === 'end'){
      startMarker = {
        icono,
        mLat : ruta.ultimoPunto[0],
        mLng: ruta.ultimoPunto[1]
      };
    }

    const marker: any = GmapsMovilidadService.pintarMarker(startMarker);
    if (ruta.idLinea) {
      marker.idRuta = ruta.idLinea;
    } else if (ruta.idRuta) {
      marker.idRuta = ruta.idRuta;
    }

    GmapsMovilidadService.markersPolylines.push(marker);
    this.markers.push(marker);
  }

  obtenerEstaciones(estaciones: any): any {
    this.estacionesMetro = [];
    estaciones.forEach(element => {
      this.estacionesMetro.push(element.descripcion);
    });
    return this.estacionesMetro;
  }

  pintarMarkers(listaRutaCercanas: any) {
    if (listaRutaCercanas) {
      // for (var index = 0; index < listaRutaCercanas.length; index++) {
      for ( const rutaCercana of listaRutaCercanas)  {
        const dataMarker = {
          icono: GmapsMovilidadService.obtenerIconoMarker(rutaCercana),
          mLat: rutaCercana.latitud,
          mLng: rutaCercana.longitud
        };

        const marker: any = GmapsMovilidadService.pintarMarker(dataMarker);

        if (rutaCercana.idLinea) {
          marker.idRuta = rutaCercana.idLinea;
        } else if (rutaCercana.idRuta){
          marker.idRuta = rutaCercana.idRuta;
        }

        GmapsMovilidadService.markersPolylines.push(marker);
        marker.dataRutaCercana = rutaCercana;
        GmapsMovilidadService.agregarInfoParadero(marker, true);
        this.markers.push(marker);
      }
    }
  }

}
