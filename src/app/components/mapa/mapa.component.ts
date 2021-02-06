import { Common } from './../../shared/utilidades/common.service';
import { MapService } from './../../providers/map.service';
import { GooglemapsService } from './../../providers/googlemaps.service';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireList } from 'angularfire2/database';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { MapStyle } from '../../shared/utilidades/map-style';
import { ModalController } from '@ionic/angular';

declare var google;

@Component({
  selector: 'mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss'],
})
export class MapaComponent implements OnInit, OnDestroy, AfterViewInit {

  static dragedPedestrian$ = new BehaviorSubject<{lat: number; lng: number; }>({ lat: 0, lng: 0 });
  static dragedNotRadiusPedestrian$ = new BehaviorSubject<{lat: number; lng: number; }>({ lat: 0, lng: 0 });

  public static mapa: any;
  public static radioAccionCircle: any;

  map = null;

  private markersToAddSubscription: Subscription;
  private markersToRemoveSubscription: Subscription;
  private polylinesToAddSubscription: Subscription;
  private polylinesToRemoveSubscription: Subscription;
  private polygonsToAddSubscription: Subscription;
  private polygonsToRemoveSubscription: Subscription;

  private adjustMapSubscription: Subscription;
  private focusOnPositionSubscription: Subscription;

  private pintarMarkersSubscription: Subscription;
  private quitarMarkersSubscription: Subscription;
  private miPuntoSubscription: Subscription;
  private volverAPuntoSubscription: Subscription;
  private cambiarZoomSubscription: Subscription;
  private pintarMarkerSubscription: Subscription;
  private renderPointSubscription: Subscription;
  private agregarKmlSubscription: Subscription;
  private quitarKmlSubscription: Subscription;
  private agregarListaPoligonoSubscription: Subscription;
  private quitarListaPoligonoSubscription: Subscription;
  private initMapSubscription: Subscription;
  private cambiarRadioAccionSubscription: Subscription;
  private removerMapaSubscription: Subscription;

  private latLng: number;
  private config: any;
  private zoom = 17;
  public miLocacion: any;
  private infowindow: any;
  private markerClusterer: any;


  comentarios: AngularFireList<any[]>;

  public static emitDragedPedestrian(latLng: { lat: number; lng: number }): void {
    MapaComponent.dragedPedestrian$.next(latLng);
  }

  public static emitDragedNoRadiusPedestrian(latLng: { lat: number; lng: number }): void {
    MapaComponent.dragedNotRadiusPedestrian$.next(latLng);
  }
  constructor(private mapCom: GooglemapsService,
              private mapProvider: MapService,
              private utilidad: Common,
              private modalCtrl: ModalController) {
                // this.infowindow = new google.maps.InfoWindow();
              }

  ngOnInit() {
  
  }

  ngAfterViewInit():void{
    console.log('OnInit Mapa Component');
    this.initSubscriptions();
    this.subscripciones();
  }

  ngOnDestroy(): void {
    this.markersToAddSubscription.unsubscribe();
    this.markersToRemoveSubscription.unsubscribe();

    this.adjustMapSubscription.unsubscribe();
    this.focusOnPositionSubscription.unsubscribe();
    this.pintarMarkersSubscription.unsubscribe();
    this.quitarMarkersSubscription.unsubscribe();
    this.miPuntoSubscription.unsubscribe();
    this.volverAPuntoSubscription.unsubscribe();
    this.cambiarZoomSubscription.unsubscribe();
    this.pintarMarkerSubscription.unsubscribe();
    this.renderPointSubscription.unsubscribe();
    this.agregarKmlSubscription.unsubscribe();
    this.quitarKmlSubscription.unsubscribe();
    this.agregarListaPoligonoSubscription.unsubscribe();
    this.quitarListaPoligonoSubscription.unsubscribe();
  }

  initSubscriptions(): void {
    this.markersToAddSubscription = this.mapCom.markersToAdd$.subscribe(
      (markers: google.maps.Marker[]) => this.addMarkers(markers)
    );

    this.markersToRemoveSubscription = this.mapCom.markersToRemove$.subscribe(
      (markers: google.maps.Marker[]) => this.removeMarkers(markers)
    );
  }

  private addMarkers(markers: google.maps.Marker[]): void {

    markers.forEach((marker: google.maps.Marker) =>
      marker.setMap(MapService.map)
    );
  }

  private removeMarkers(markers: google.maps.Marker[]): void {
    markers.forEach((marker: google.maps.Marker) =>
      marker.setMap(MapService.map)
    );
  }

  subscripciones() {
    this.adjustMapSubscription = this.mapCom.adjustMap$.subscribe(() =>
      this.fitMarkersInScreen()
    );
    this.focusOnPositionSubscription = this.mapCom.focusOnPosition$.subscribe(
      (position: any) => this.focusOnPosition(position)
    );

    this.pintarMarkersSubscription = this.mapCom.pintarMarkers$.subscribe(
      (data: any) => {
        this.pintarMarkers(data);
      }
    );

    this.pintarMarkerSubscription = this.mapCom.pintarMarker$.subscribe(
      data => {
        return this.pintarMarker(data);
      }
    );

    this.quitarMarkersSubscription = this.mapCom.quitarMarkers$.subscribe(data => {
        this.quitarMarker(data);
      }
    );

    this.miPuntoSubscription = this.mapCom.miPuntoSub$.subscribe(data => {
      return this.miPunto(data);
    });


    this.volverAPuntoSubscription = this.mapCom.volverAPunto$.subscribe(
      data => {
        this.volverAPunto(data);
      }
    );

    this.cambiarZoomSubscription = this.mapCom.cambiarZoom$.subscribe(data => {
      this.cambiarZoom(data);
    });

    this.renderPointSubscription = this.mapCom.renderPoint$.subscribe(data => {
      this.renderPoint(data);
    });

    this.agregarKmlSubscription = this.mapCom.agregarKml$.subscribe(data => {
      this.agregarKml(data);
    });

    this.quitarKmlSubscription = this.mapCom.quitarKml$.subscribe(data => {
      this.quitarKml(data);
    });

    this.agregarListaPoligonoSubscription = this.mapCom.agregarListaPoligono$.subscribe(
      data => {
        this.agregarListaPoligono(data);
      }
    );

    this.quitarListaPoligonoSubscription = this.mapCom.quitarListaPoligono$.subscribe(
      data => {
        this.quitarListaPoligono(data);
      }
    );

    this.initMapSubscription = this.mapCom.initMap$.subscribe(data => {
      // this.initMap();
      this.loadMap();
    });


    this.cambiarRadioAccionSubscription = this.mapCom.cambiarRadioAccion$.subscribe(
      data => {
        //  this.cambiarRadioAccion(data);
      }
    );

    this.removerMapaSubscription = this.mapCom.removerMapa$.subscribe(() => {
      this.removerMapa();
    });
  }

    private initMap(): void {
        MapService.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 9,
            center: { lat: 6.263527, lng: -75.5559108 },
            disableDefaultUI: true,
            styles: MapStyle.estiloMapa,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            draggable: true,
            gestureHandling: 'greedy'
        });
        this.setZoomListener();
    }

    loadMap() {
      // create a new map by passing HTMLElement
      const mapEle: HTMLElement = document.getElementById('map');
      // create LatLng object
      const myLatLng = {lat: 6.263527, lng: -75.5559108};
      // create map
      this.map = new google.maps.Map(mapEle, {
        center: myLatLng,
        zoom: 9,
        disableDefaultUI: true,
        styles: MapStyle.estiloMapa,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        draggable: true,
        gestureHandling: 'greedy'
      });

      // google.maps.event.addListenerOnce(this.map, 'idle', () => {
      //   mapEle.classList.add('show-map');
      // });
      this.setZoomListener();
    }

  loadJSON(file, callback) {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType('application/json');
    xobj.open('GET', file, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = () => {
      if (xobj.readyState === 4 && xobj.status === 200) {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        callback(xobj.responseText);
      }
    };
    xobj.send(null);
  }

  load() {
    this.loadJSON('assets/retiros-quebradas.json', (response) => {
      const polygons = JSON.parse(response);
      polygons.features.forEach(feature => {
        const ring = feature.geometry.rings[0];
        const ringLatLng = new Array();
        ring.forEach(point => {
          ringLatLng.push(new google.maps.LatLng(point[0], point[1]));
        });
        const encoded = google.maps.geometry.encoding.encodePath(ringLatLng);
        const decoded = google.maps.geometry.encoding.decodePath(encoded);
        const polyDecoded = decoded.map(item => {
          return { lat: item.lng(), lng: item.lat() };
        });
        const poly = new google.maps.Polygon({
          paths: polyDecoded,
          map: MapService.map
        });

        const test = new google.maps.Polygon({
          map: MapService.map,
          paths: [
            { lat: 6.2861727, lng: -75.5909102 },
            { lat: 6.2860758, lng: -75.5793267 },
            { lat: 6.2800702, lng: -75.5791813 },
            { lat: 6.2761799, lng: -75.5885524 }
          ]
        });

      });
    });
  }

  setZoomListener(): void {
    MapService.map.addListener('zoom_changed', () => {
      console.log('zoom_changed fired');
      this.mapCom.emitZoomChange(MapService.map.getZoom());
    });
  }

  miPunto(objeto: {
    lat: any;
    lng: any;
    icono: string;
    animation: google.maps.Animation;
  }) {
    const icon = {
      url: objeto.icono,
      scaledSize: new google.maps.Size(50, 50) // scaled size
    };

    if (this.miLocacion) {
      this.miLocacion.setPosition(
        new google.maps.LatLng(objeto.lat, objeto.lng)
      );
    } else {
      this.miLocacion = new google.maps.Marker({
        position: new google.maps.LatLng(objeto.lat, objeto.lng),
        map: MapService.map,
        icon,
        draggable: true,
        animation: objeto.animation
      });

      const v = this;
      // google.maps.event.addListener(this.miLocacion, 'dragend', (e) => {
      //   v.events.publish('changeGeolocation', e.latLng.lat, e.latLng.lng);
      // });
      return this.miLocacion;
    }
  }

  pintarMarkers(objeto: any) {
    if (!this.mapCom.ListaMarcadores[objeto.capaPadre]) {
      this.mapCom.ListaMarcadores[objeto.capaPadre] = {};
    }
    if (this.mapCom.ListaMarcadores[objeto.capaPadre][objeto.id]) {
      if (this.mapCom.ListaMarcadores[objeto.capaPadre][objeto.id].length > 0) {
        this.mapCom.quitarMarkers(
          this.mapCom.ListaMarcadores[objeto.capaPadre][objeto.id]
        );
        const objetoListarPoligono: any = {};
        objetoListarPoligono.poligono = this.mapCom.ListaMarcadores[
          objeto.capaPadre
        ][objeto.id];
        objetoListarPoligono.id = objeto.id;
        objetoListarPoligono.capaPadre = objeto.capaPadre;
        this.mapCom.quitarListaPoligono(objetoListarPoligono);
        delete this.mapCom.ListaMarcadores[objeto.capaPadre][objeto.id];
        return;
      } else {
        delete this.mapCom.ListaMarcadores[objeto.capaPadre][objeto.id];
      }
    } else {
      this.mapCom.ListaMarcadores[objeto.capaPadre][objeto.id] = [];
    }

    let marker: any;
    const listaProcesados: any = [];
    const listaPologonos: any = [];
    let obsArray: any;
    try {
      if (objeto.marcadores.length > 0) {
        obsArray = of(objeto.marcadores);
      } else if (objeto.subcategorias.length > 0) {
        obsArray = of(objeto.subcategorias);
      }
    } catch (error) {}

    if (!obsArray) {
      return;
    }

    obsArray.subscribe((item: any) => {
      item.forEach(dato => {
        if (dato.marcadores) {
          dato.marcadores.forEach(subcategoria => {
            if (subcategoria.poligono) {
              const coordPoligono = [];
              let poligono;

              subcategoria.coordenadas.forEach(element => {
                element.coordenadaPolygon = this.utilidad.crearCoordendas(
                  element.coordenadaPolygon
                );
                if (element.coordenadaPolygon.length > 1) {
                  element.coordenadaPolygon.forEach(cord => {
                    coordPoligono.push({
                      lat: cord.latitud,
                      lng: cord.longitud
                    });
                  });
                  try {
                    const strokeColor = this.utilidad.convertColorArrayToRgb(
                      subcategoria.colorFondo
                    );
                    const fillColor = this.utilidad.convertColorArrayToRgb(
                      subcategoria.colorBorde
                    );
                    poligono = new google.maps.Polygon({
                      paths: coordPoligono,
                      strokeColor: fillColor,
                      strokeOpacity: 0.8,
                      strokeWeight: 0.5,
                      fillColor: strokeColor,
                      fillOpacity: 0.35
                    });
                    poligono.setMap(MapService.map);
                    listaPologonos.push(poligono);

                    const objetoListarPoligono: any = {};
                    objetoListarPoligono.nombre = subcategoria.nombre;
                    objetoListarPoligono.objetoGoogle = poligono;
                    objetoListarPoligono.titulo = 'Información';
                    objetoListarPoligono.id = objeto.id;
                    objetoListarPoligono.capaPadre = objeto.capaPadre;
                    listaProcesados.push(objetoListarPoligono);

                    if (dato.ventanaInformacion) {
                      const idObjeto =
                        'idRutas' + '_' + objeto.id + '_' + dato.nombre;

                      const compMovilidad = { idObjeto: '', descripcion: '' };
                      compMovilidad.idObjeto = idObjeto;
                      compMovilidad.descripcion = dato.nombre;

                      let rutaLogoVentanaInfo = '';
                      if (dato.ventanaInformacion.icono) {
                        rutaLogoVentanaInfo =
                          dato.ventanaInformacion.icono.rutaLogo;
                      }

                      let contenido2 =
                        `<style>
                .gm-style-iw {
                  height: 100% !important;
               }

               .boton_personalizado{
                text-decoration: none;
                height-max: 15px;
                padding: 5px;
                font-size: 1rem;
                color: #006FAC;
                background-color: #ffffff;
                border-radius: 6px;
                border: 1px solid #006FAC;
                position: fixed;
                text-align: center;
                display: inline-flex;
              }
              .boton_personalizado:hover{
                //color: #1883ba;
                background-color: #F8F9F9 ;
              }
                </style>
                <div id="height: auto;">
                <div  style="background-color:` +
                        dato.ventanaInformacion.color +
                        `; width: 100%; min-height:3rem; text-align: center; display: block; padding: .7rem" >` +
                        `<img style="height:auto; width:30px; margin-top: .5rem; margin-bottom: 0px; position: relative;" src="` +
                        rutaLogoVentanaInfo +
                        `" >` +
                        `<label style="margin-top: 0rem; margin-bottom: 0rem; font-size: 1rem; "><p style="color:withe; padding-left: .2rem; padding-rigth: .2rem;">` +
                        dato.ventanaInformacion.nombre +
                        `</p> </label>` +
                        `</div>` +
                        `<div class="boton_personalizado" id="` +
                        idObjeto +
                        `">
                <div  style="background-color:` +
                        dato.ventanaInformacion.color +
                        `; width: 100%; min-height:3rem; text-align: center; display: block;" >
                <img style="height:15px; width:auto; margin-top: .5rem; margin-bottom: 0px; position: relative;" src="assets/movilidad/iconos/rutas.png" >
                <label>Ruta</label>` +
                        ` </div>
              </div>`;

                      if (dato.ventanaInformacion.descripcion) {
                        contenido2 +=
                          `<div style = "text-align: center; padding: .8rem; overflow: scroll; max-height:100px; overflow-x: hidden;"> <p style="color:` +
                          dato.ventanaInformacion.color +
                          `; font-size: 1rem;"> <b> Descripción </b> </p>` +
                          `<p style = "color:black; font-size: 1rem;">` +
                          dato.ventanaInformacion.descripcion +
                          ` </p> ` +
                          `<hr style="height: .7px; background-color: gray; margin-left: .5rem; margin-rigth: .5rem;" />`;
                      }

                      if (dato.ventanaInformacion.descripcion2) {
                        contenido2 +=
                          `<p style = "color:black; font-size: 1rem;" >` +
                          dato.ventanaInformacion.descripcion2 +
                          ` </p> `;
                      }
                      if (dato.ventanaInformacion.multimedia) {
                        // contenido2  += `<img style="height:auto; max-width:80px; margin-top:
                        // 1rem; margin-bottom: .5rem;" src="` + dato.ventanaInformacion.multimedia + `" >`;
                        // `</div>`;
                      }
                      contenido2 += `</div>`;
                      // if(false){
                      //   contenido2 += `</div>`;
                      //   `<div id="idComentariosAvistamientos" style = "text-align: center; padding: .12rem;  max-height:100px;"> `;

                      //   contenido2 += `<div>`;
                      //   contenido2 += `<button style="color:white;background-color:` +
                      // dato.ventanaInformacion.color + `" id = "idComentar" type="button">Ver comentarios</button>`;
                      //   contenido2 += `</div>`;
                      // }

                      contenido2 +=
                        `</div> ` +
                        `</div>
              </div>`;

                      this.crearInfoWindow(
                        poligono,
                        { content: contenido2, maxWidth: 500, dato },
                        compMovilidad
                      );
                    }
                  } catch (e) {
                    console.log('error creando poligon', e);
                  }
                }
              });
              // contadorSubcategoria ++
            }

            // var objetoListarPoligono: any = {};
            // objetoListarPoligono.nombre = subcategoria.nombre;
            // objetoListarPoligono.objetoGoogle = poligono;
            // objetoListarPoligono.titulo = "Información";
            // objetoListarPoligono.id = objeto.id;
            // objetoListarPoligono.capaPadre = objeto.capaPadre;
            // //this.mapCom.agregarListaPoligono(objetoListarPoligono);
            // listaProcesados.push(objetoListarPoligono);

            // if(contadorSubcategoria === 10)
            // {
            //  return;
            // }
          });
        } else if (dato.coordenadas) {
          if (dato.poligono && objeto.capaPadre === 8) {
            let poligono;

            dato.coordenadas.forEach(element => {
              const coordPologono = [];

              if (element.coordenadaPolygon.length > 1) {
                element.coordenadaPolygon = this.utilidad.crearCoordendas(
                  element.coordenadaPolygon
                );
                element.coordenadaPolygon.forEach(cord => {
                  coordPologono.push({ lat: cord.latitud, lng: cord.longitud });
                });
                try {
                  const strokeColor = this.utilidad.convertColorArrayToRgb(
                    dato.colorFondo
                  );
                  const fillColor = this.utilidad.convertColorArrayToRgb(
                    dato.colorBorde
                  );

                  poligono = new google.maps.Polygon({
                    paths: coordPologono,
                    strokeColor,
                    strokeOpacity: 0.8,
                    strokeWeight: 0.5,
                    fillColor,
                    fillOpacity: 0.35
                  });
                  poligono.setMap(MapService.map);
                  listaPologonos.push(poligono);

                  const objetoListarPoligono: any = {};
                  objetoListarPoligono.nombre = dato.nombre;
                  objetoListarPoligono.objetoGoogle = poligono;
                  objetoListarPoligono.titulo = 'Información';
                  objetoListarPoligono.id = objeto.id;
                  objetoListarPoligono.capaPadre = objeto.capaPadre;
                  // this.mapCom.agregarListaPoligono(objetoListarPoligono);
                  listaProcesados.push(objetoListarPoligono);

                  if (dato.ventanaInformacion) {
                    const idObjeto =
                      'idRutas' + '_' + objeto.id + '_' + dato.nombre;

                    const compMovilidad = { idObjeto: '', descripcion: '' };
                    compMovilidad.idObjeto = idObjeto;
                    compMovilidad.descripcion = dato.nombre;

                    let rutaLogoVentanaInfo = '';
                    if (dato.ventanaInformacion.icono) {
                      rutaLogoVentanaInfo =
                        dato.ventanaInformacion.icono.rutaLogo;
                    }

                    let contenido2 =
                      `<style>
                      .gm-style-iw {
                        height: 100% !important;
                     }

                     .boton_personalizado{
                      text-decoration: none;
                      height-max: 15px;
                      padding: 5px;
                      font-size: 1rem;
                      color: #006FAC;
                      background-color: #ffffff;
                      border-radius: 6px;
                      border: 1px solid #006FAC;
                      position: fixed;
                      text-align: center;
                      display: inline-flex;
                    }
                    .boton_personalizado:hover{
                      //color: #1883ba;
                      background-color: #F8F9F9 ;
                    }
                      </style>
                      <div id="height: auto;">
                      <div  style="background-color:` +
                      dato.ventanaInformacion.color +
                      `; width: 100%; min-height:3rem; text-align: center; display: block; padding: .7rem" >` +
                      `<img style="height:auto; width:30px; margin-top: .5rem; margin-bottom: 0px; position: relative;" src="` +
                      rutaLogoVentanaInfo +
                      `" >` +
                      `<label style="margin-top: 0rem; margin-bottom: 0rem; font-size: 1rem; "><p style="color:withe; padding-left: .2rem; padding-rigth: .2rem;">` +
                      dato.ventanaInformacion.nombre +
                      `</p> </label>` +
                      `</div>` +
                      `<div class="boton_personalizado" id="` +
                      idObjeto +
                      `">
                      <div  style="background-color:` +
                      dato.ventanaInformacion.color +
                      `; width: 100%; min-height:3rem; text-align: center; display: block;" >
                      <img style="height:15px; width:auto; margin-top: .5rem; margin-bottom: 0px; position: relative;" src="assets/movilidad/iconos/rutas.png" >
                      <label>Ruta</label>` +
                      ` </div>
                    </div>`;

                    if (dato.ventanaInformacion.descripcion) {
                      contenido2 +=
                        `<div style = "text-align: center; padding: .8rem; overflow: scroll; max-height:100px; overflow-x: hidden;"> <p style="color:` +
                        dato.ventanaInformacion.color +
                        `; font-size: 1rem;"> <b> Descripción </b> </p>` +
                        `<p style = "color:black; font-size: 1rem;">` +
                        dato.ventanaInformacion.descripcion +
                        ` </p> ` +
                        `<hr style="height: .7px; background-color: gray; margin-left: .5rem; margin-rigth: .5rem;" />`;
                    }

                    if (dato.ventanaInformacion.descripcion2) {
                      contenido2 +=
                        `<p style = "color:black; font-size: 1rem;" >` +
                        dato.ventanaInformacion.descripcion2 +
                        ` </p> `;
                    }
                    if (dato.ventanaInformacion.multimedia) {
                      // contenido2  += `<img style="height:auto; max-width:80px; margin-top: 1rem; margin-bottom:
                      // .5rem;" src="` + dato.ventanaInformacion.multimedia + `" >`;
                      // `</div>`;
                    }
                    contenido2 += `</div>`;
                    // if(false){
                    //   contenido2 += `</div>`;
                    //   `<div id="idComentariosAvistamientos" style = "text-align: center; padding: .12rem;  max-height:100px;"> `;

                    //   contenido2 += `<div>`;
                    //   contenido2 += `<button style="color:white;background-color:` + dato.ventanaInformacion.color +
                    // `" id = "idComentar" type="button">Ver comentarios</button>`;
                    //   contenido2 += `</div>`;
                    // }

                    contenido2 +=
                      `</div> ` +
                      `</div>
                    </div>`;

                    this.crearInfoWindow(
                      poligono,
                      { content: contenido2, maxWidth: 500, dato },
                      compMovilidad
                    );
                  }
                } catch (e) {
                  console.log('error creando poligon', e);
                }
              }
            });

            // var objetoListarPoligono: any = {};
            // objetoListarPoligono.nombre = dato.nombre;
            // objetoListarPoligono.objetoGoogle = poligono;
            // objetoListarPoligono.titulo = "Información";
            // objetoListarPoligono.id = objeto.id;
            // objetoListarPoligono.capaPadre = objeto.capaPadre;
            // //this.mapCom.agregarListaPoligono(objetoListarPoligono);
            // listaProcesados.push(objetoListarPoligono);
          } else {
            dato.coordenadas.forEach(element => {
              if (objeto.iconoMarcador) {
                const icono = {
                  url: objeto.iconoMarcador.rutaLogo,
                  scaledSize: new google.maps.Size(40, 40)
                };
                element.coordenadaPunto = this.utilidad.crearCoordendas(
                  element.coordenadaPunto
                );
                element.coordenadaPunto.forEach(punto => {
                  marker = new google.maps.Marker({
                    position: new google.maps.LatLng(
                      punto.latitud,
                      punto.longitud
                    ),
                    map: MapService.map,
                    icon: icono
                    // title: 'Click to zoom'
                  });
                });
              } else if (dato.icono) {
                const icono = {
                  url: dato.icono.rutaLogo,
                  scaledSize: new google.maps.Size(40, 40)
                };
                element.coordenadaPunto = this.utilidad.crearCoordendas(
                  element.coordenadaPunto
                );
                element.coordenadaPunto.forEach(punto => {
                  marker = new google.maps.Marker({
                    position: new google.maps.LatLng(
                      punto.latitud,
                      punto.longitud
                    ),
                    map: MapService.map,
                    icon: icono
                    // title: 'Click to zoom'
                  });
                });
              } else {
                marker = new google.maps.Marker({
                  position: new google.maps.LatLng(
                    element.coordenadaPunto.latitud,
                    element.coordenadaPunto.longitud
                  ),
                  map: MapService.map
                });
              }

              if (dato.ventanaInformacion) {
                const idObjeto = 'idRutas' + '_' + objeto.id + '_' + dato.nombre;

                const compMovilidad = { idObjeto: '', descripcion: '' };
                compMovilidad.idObjeto = idObjeto;
                compMovilidad.descripcion = dato.nombre;

                let rutaLogoVentanaInfo = '';
                if (dato.ventanaInformacion.icono) {
                  rutaLogoVentanaInfo = dato.ventanaInformacion.icono.rutaLogo;
                }

                let contenido2 =
                  `<style>
                  .gm-style-iw {
                    height: 100% !important;
                 }

                 .boton_personalizado{
                  text-decoration: none;
                  height-max: 15px;
                  padding: 5px;
                  font-size: 1rem;
                  color: #006FAC;
                  background-color: #ffffff;
                  border-radius: 6px;
                  border: 1px solid #006FAC;
                  position: fixed;
                  text-align: center;
                  display: inline-flex;
                }
                .boton_personalizado:hover{
                  //color: #1883ba;
                  background-color: #F8F9F9 ;
                }
                  </style>
                  <div id="height: auto;">
                  <div  style="background-color:` +
                  dato.ventanaInformacion.color +
                  `; width: 100%; min-height:3rem; text-align: center; display: block; padding: .7rem" >` +
                  `<img style="height:auto; width:30px; margin-top: .5rem; margin-bottom: 0px; position: relative;" src="` +
                  rutaLogoVentanaInfo +
                  `" >` +
                  `<label style="margin-top: 0rem; margin-bottom: 0rem; font-size: 1rem; "><p style="color:withe; padding-left: .2rem; padding-rigth: .2rem;">` +
                  dato.ventanaInformacion.nombre +
                  `</p> </label>` +
                  `</div>` +
                  `<div class="boton_personalizado" id="` +
                  idObjeto +
                  `">
                  <div  style="background-color:` +
                  dato.ventanaInformacion.color +
                  `; width: 100%; min-height:3rem; text-align: center; display: block;" >
                  <img style="height:15px; width:auto; margin-top: .5rem; margin-bottom: 0px; position: relative;" src="assets/movilidad/iconos/rutas.png" >
                  <label>Ruta</label>` +
                  ` </div>
                </div>`;

                if (dato.ventanaInformacion.descripcion) {
                  contenido2 +=
                    `<div style = "text-align: center; padding: .8rem; overflow: scroll; max-height:100px; overflow-x: hidden;"> <p style="color:` +
                    dato.ventanaInformacion.color +
                    `; font-size: 1rem;"> <b> Descripción </b> </p>` +
                    `<p style = "color:black; font-size: 1rem;">` +
                    dato.ventanaInformacion.descripcion +
                    ` </p> ` +
                    `<hr style="height: .7px; background-color: gray; margin-left: .5rem; margin-rigth: .5rem;" />`;
                }

                if (dato.ventanaInformacion.descripcion2) {
                  contenido2 +=
                    `<p style = "color:black; font-size: 1rem;" >` +
                    dato.ventanaInformacion.descripcion2 +
                    ` </p> `;
                }
                if (dato.ventanaInformacion.multimedia) {
                  // contenido2  += `<img style="height:auto; max-width:80px; margin-top: 1rem; margin-bottom:
                  // .5rem;" src="` + dato.ventanaInformacion.multimedia + `" >`;
                  // </div>`;
                }
                contenido2 += `</div>`;
                // if(false){
                //   contenido2 += `</div>`;
                //   `<div id="idComentariosAvistamientos" style = "text-align: center; padding: .12rem;  max-height:100px;"> `;

                //   contenido2 += `<div>`;
                //   contenido2 += `<button style="color:white;background-color:` + dato.ventanaInformacion.
                // color + `" id = "idComentar" type="button">Ver comentarios</button>`;
                //   contenido2 += `</div>`;
                // }

                contenido2 +=
                  `</div> ` +
                  `</div>
                </div>`;

                this.crearInfoWindow(
                  marker,
                  { content: contenido2, maxWidth: 500, dato },
                  compMovilidad
                );
              }
              const objetoListarMarcador: any = {};
              objetoListarMarcador.nombre = dato.nombre;
              objetoListarMarcador.objetoGoogle = marker;
              objetoListarMarcador.titulo = 'Información';
              objetoListarMarcador.id = objeto.id;
              objetoListarMarcador.capaPadre = objeto.capaPadre;
              // this.mapCom.agregarListaPoligono(objetoListarPoligono);
              listaProcesados.push(objetoListarMarcador);
            });
          }
        }
      });

      if (listaProcesados.length > 0) {
        this.mapCom.ListaMarcadores[objeto.capaPadre][
          objeto.id
        ] = listaProcesados;
      } else if (listaPologonos.length > 0) {
        this.mapCom.ListaMarcadores[objeto.capaPadre][
          objeto.id
        ] = listaPologonos;
      }
    });
  }

  crearInfoWindow(marker: any, contenido: any, objetoMovilidad: any) {
    const infowindow = new google.maps.InfoWindow(contenido);
    // this.infowindow.setContent(contenido);
    const entorno = this.modalCtrl;
    const env = this;
    marker.addListener('click', (event) => {
      infowindow.open(MapService.map, marker);
      infowindow.setPosition(event.latLng);
      try {
        document.getElementById('idComentar').addEventListener('click', () => {
          // const modal = await entorno.create({ModalPage, contenido.dato});
          // modal.present();
        });
      } catch (error) {}

      try {
        // document
        //   .getElementById(objetoMovilidad.idObjeto)
        //   .addEventListener('click', () => {
        //     env.posiblesViajesProvider.origen.lat = env.mapCom.posicionLat;
        //     env.posiblesViajesProvider.origen.lon = env.mapCom.posicionLon;
        //     env.posiblesViajesProvider.origen.descripcion = 'mi ubicacion';

        //     env.posiblesViajesProvider.destino.lat = event.latLng.lat();
        //     env.posiblesViajesProvider.destino.lon = event.latLng.lng();
        //     // env.posiblesViajesProvider.destino.descripcion =
        //     //   objetoMovilidad.descripcion;

        //     env.posiblesViajesProvider
        //       .obtenerviajesSugeridos()
        //       .then(data => {
        //         this.app.getRootNav().push(VistaViajesPage, data);
        //       })
        //       .catch(error => {
        //         this.common.basicAlert('Movilidad', error);
        //       });
        //   });
      } catch (error) {}

      // this.avistamientos.abrirModalAvistamientos(contenido.dato);
    });
  }

  quitarMarker(listaMarkers: any) {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < listaMarkers.length; i++) {
      // tslint:disable-next-line:no-string-literal
      listaMarkers[i]['objetoGoogle'].setMap(null);
    }
  }

  volverAPunto(objeto: { lat: number; long: number }) {
    MapService.map.setCenter(
      new google.maps.LatLng(objeto.lat, objeto.long)
    );
    MapService.map.setZoom(this.zoom);
  }

  cambiarZoom(objeto: { lat: number; long: number; zoom: number }) {
    MapService.map.setCenter(
      new google.maps.LatLng(objeto.lat, objeto.long)
    );
    MapService.map.setZoom(objeto.zoom);
  }

  public removerMapa() {
    MapService.map = undefined;
  }

  renderPoint(objeto: { result: any; polyline: any }) {
    let flightPath;
    const Caminando = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 4
    };
    const Carro = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
    };

    switch (objeto.polyline) {
      case 'Caminando': {
        flightPath = new google.maps.Polyline({
          path: objeto.result,
          geodesic: true,
          icons: [
            {
              icon: Caminando,
              offset: '0',
              repeat: '20px'
            }
          ],
          strokeOpacity: 0,
          strokeColor: '#1636ff',
          strokeWeight: 2
        });
        break;
      }
      case 'Carro': {
        flightPath = new google.maps.Polyline({
          path: objeto.result,
          geodesic: true,
          icons: [
            {
              icon: Carro,
              offset: '0',
              repeat: '20px'
            }
          ]
        });
        break;
      }
      case 'Metro': {
        flightPath = new google.maps.Polyline({
          path: objeto.result,
          geodesic: true,
          strokeOpacity: 1,
          strokeColor: '#ff5e00',
          strokeWeight: 2
        });
        break;
      }
      case 'Tranvia': {
        flightPath = new google.maps.Polyline({
          path: objeto.result,
          geodesic: true,
          strokeOpacity: 1,
          strokeColor: '#00ff2a',
          strokeWeight: 2
        });
        break;
      }
      case 'Encicla': {
        flightPath = new google.maps.Polyline({
          path: objeto.result,
          geodesic: true,
          strokeOpacity: 1,
          strokeColor: '#ff00ee',
          strokeWeight: 2
        });
        break;
      }
    }
    flightPath.setMap(MapService.map);
  }

  // Metodos utilizando cluster maps
  /*
  addMarkers(markers: any): void {
    this.markerClusterer.addMarkers(markers);
    this.fitMarkersInScreen();
  }

  removeMarkers(markers: any): void {
    if (markers == null) this.markerClusterer.clearMarkers();
    else {
      markers.forEach(
        (marker: any) => this.markerClusterer.removeMarker(marker)
      );
    }
    this.fitMarkersInScreen();
  }*/

  fitMarkersInScreen(): void {
    const markers = this.markerClusterer.getMarkers();
    if (markers.length === 0) {return; }
    let minLat: number = markers[0].getPosition().lat();
    let minLng: number = markers[0].getPosition().lng();
    let maxLat: number = markers[0].getPosition().lat();
    let maxLng: number = markers[0].getPosition().lng();
    for (let i = 1; i < markers.length; i++) {
      const lat: number = markers[i].getPosition().lat();
      const lng: number = markers[i].getPosition().lng();

      if (lat < minLat) { minLat = lat; }
      else if (lat > maxLat) {maxLat = lat; }

      if (lng < minLng) {minLng = lng; }
      else if (lng > maxLng) {maxLng = lng; }
    }
    const latLngBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(minLat, minLng),
      new google.maps.LatLng(maxLat, maxLng)
    );
    // padding not working between [0, 14); between [15..) it's doing to much padding
    const padding = 0;
    MapService.map.fitBounds(latLngBounds);
  }

  focusOnPosition(position: any): void {
    MapService.map.panTo(position);
    MapService.map.setZoom(16);
  }

  addKmls(kmls: any) {
    kmls.forEach((kml: any) => kml.setMap(MapService.map));
  }

  removeKmls(kmls: any) {
    kmls.forEach((kml: any) => kml.setMap(null));
  }

  agregarKml(url: string) {
    return new google.maps.KmlLayer({
      url,
      map: MapService.map,
      suppressInfoWindows: true
    });
  }

  quitarKml(kml) {
    if (kml) {
      kml.setMap(null);
    }
  }

  pintarMarker(objetoMarker: {
    icono: string;
    contenidoInfo: string;
    mLat: number;
    mLng: number;
  }) {
    let marker: any;
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(objetoMarker.mLat, objetoMarker.mLng),
      map: MapService.map,
      icon: objetoMarker.icono
    });

    return marker;
  }

  agregarListaPoligono(objeto) {
    const objetoPoligono = {
      poligono: {},
      nombre: String,
      titulo: String,
      desplegado: true,
      id: Number,
      idPadre: Number
    };
    objetoPoligono.poligono = objeto.poligono;
    objetoPoligono.id = objeto.id;
    objetoPoligono.idPadre = objeto.idPadre;
    objetoPoligono.nombre = objeto.nombre;
    objetoPoligono.titulo = objeto.titulo;
    this.mapCom.puntosPoligonos.push(objetoPoligono);
  }

  quitarListaPoligono(objeto) {
    const arreglo = this.mapCom.puntosPoligonos;
    const eliminar = [];
    arreglo.forEach((item, index) => {
      if (item.id === objeto.id && item.idPadre === objeto.idPadre) {
        eliminar.push(item);
      }
    });
    eliminar.forEach((item, index) => {
      this.mapCom.puntosPoligonos.splice(
        this.mapCom.puntosPoligonos.indexOf(index),
        1
      );
    });
  }

}
