import { MapService } from './../map.service';
import { LayerService } from './../layer.service';
import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { Common } from '../../shared/utilidades/common.service';
import { ModoEstacion } from '../../entities/movilidad/constantes';
import { MapaComponent } from '../../components/mapa/mapa.component';
import { Ubicacion } from '../../entities/movilidad/ubicacion.model';

@Injectable({
  providedIn: 'root'
})
export class GmapsMovilidadService {

  static infoWindow: any;
    static contentInfoWindow: string;
    static rutasLineas: any = [];
    static markersPolylines: any = [];
    static markersPolylinesViajes: any = [];
    static polylines: any = [];

    static locationMarker: google.maps.Marker;
    static actionRadiusCircle: google.maps.Circle;
    static radio: number;
    static common: Common;

    private static markerClick = new Subject<any>();
    static markerClick$: Observable<
        any
    > = GmapsMovilidadService.markerClick.asObservable();

    // ciclo  parqueaderos
    static getMarkerInfoSubscription: Subscription;
    static layerProvider: LayerService;


    static emitMarkerClick(data: any) {
        this.markerClick.next(data);
    }

    public static getMapa() {
        return MapService.map;
    }

    public static centrarMapa(latitud: number, longitud: number) {
      MapService.map.setCenter(new google.maps.LatLng(latitud, longitud));

      if (this.radio <= 500) {
        MapService.map.setZoom(16);
      } else if (this.radio > 500 && this.radio < 1300) {
        MapService.map.setZoom(15);
      } else {
        MapService.map.setZoom(14);
      }
    }

    public static centrarMapaDetailViaje(
        latitud: number,
        longitud: number,
        zoomAmount: number
    ) {
      MapService.map.setCenter(new google.maps.LatLng(latitud, longitud));
      MapService.map.setZoom(zoomAmount);
    }

    public static eliminarMarkersPolylines(markersPolylines: any[]) {
        console.log(markersPolylines);
        markersPolylines.forEach((marker: google.maps.Marker) => {
            marker.setMap(null);
        });
    }

    public static obtenerRadio(): number {
        return this.radio;
    }

    public static setRadio(actionRadius: number): void {
        this.radio = actionRadius;
        if (
            this.actionRadiusCircle !== undefined ||
            this.actionRadiusCircle != null
        ) {
            this.updateGraphicRadius(actionRadius);
        }
    }

    public static guardarRadio(actionRadius: any) {
        const pusuario: any = JSON.parse(localStorage.getItem('usuario'));
        const objPreferencias = JSON.parse(pusuario.preferencias);
        objPreferencias.preferencias.forEach(element => {
            if (element.id === 7) {
                element.radioAccion = actionRadius;
            }
        });
        pusuario.preferencias = JSON.stringify(objPreferencias);
        localStorage.setItem('usuario', JSON.stringify(pusuario));
    }

    public static pintarMarker(dataMarker) {
        let icon;
        if (dataMarker.icono === 'assets/mapa/ubicacion_movi.png') {
            icon = {
                url: dataMarker.icono, // url
                scaledSize: new google.maps.Size(40, 46) // size
            };
        } else {
            icon = {
                url: dataMarker.icono, // url
                scaledSize: new google.maps.Size(32, 32) // size
            };
        }

        const marker = new google.maps.Marker({
            position: new google.maps.LatLng(dataMarker.mLat, dataMarker.mLng),
            map: MapService.map,
            icon
        });

        return marker;
    }

    public static crearInfoWindow(
        contentData: any,
        marker: any,
        isMarkerWithoutDetail?: boolean,
        isCicloParqueadero?: boolean
    ): any {
        if (this.infoWindow) {
            this.infoWindow.close();
        }

        this.infoWindow = new google.maps.InfoWindow({
            content: '',
            maxWidth: 500
        });

        if (isMarkerWithoutDetail) {
            this.setContentInfoWindowWithoutDetail(contentData);
        } else {
            this.setContenInfoWindows(contentData, isCicloParqueadero);
        }

        this.infoWindow.setContent(this.contentInfoWindow);
        this.infoWindow.open(MapService.map, marker);
        // this.centrarMapa(marker.getPosition().lat(), marker.getPosition().lng())
        MapService.map.panTo(marker.position);

        this.infoWindow.addListener('domready', (args: any[]): void => {
            document
                .getElementById('infoContainer')
                .addEventListener('click', () => {
                    this.infoWindow.close();
                    this.emitMarkerClick(contentData);
                });

            document
                .getElementById('closeInfoWindow')
                .addEventListener('click', () => {
                    this.infoWindow.close();
                });
        });

        return this.infoWindow;
    }

    public static closestByClass(el, clazz) {
        while (el.className !== clazz) {
            el = el.parentNode;
            if (!el) {
                return null;
            }
        }

        return el;
    }

    public static centrarInfoWindow(latLng: any) {
        if (this.infoWindow) {
            this.infoWindow.setPosition(latLng);
        }
    }

    private static setContentInfoWindowWithoutDetail(contentData: any) {
        const icono_estacion = this.obtenerIconoInfoWindow(contentData);
        const titulo = this.obtenerTituloInfoWindows(contentData);
        const content = this.parseContentInfoWindow(contentData);
        this.contentInfoWindow = `
        <style>
          .gm-style-iw {
              height: 170px !important;
              width:100%!important;
              max-width:100%!important;
              max-height:170px!important;
              min-height: 86px !important;
          }
          .gm-style .gm-style-iw {
              display: contents!important;
          }
          .gm-style .gm-style-iw-c {
              background-color:transparent!important;
              box-shadow:none!important;
              overflow: visible!important;
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
              color: grey;

          }
          .gm-style .buttonsi .buttoni .button-inner{
              margin-right:15px;
              margin-top: -10px;

  }
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
              max-width: 90%!important;
              width:90%!important;
              max-height: 100px!important;
              position: absolute!important;
              bottom: 10px!important;
              left: -45%!important;
              min-height: 70px;
              height: auto;
          }
          .content-ios .gm-style .box-card {

          }
          .gm-style .box-card .header {
              width: 100%!important;
              height:10px!important;
              border-radius:6px 6px 0 0!important;
              color:#ffffff;
              padding:10px 5px;
              text-align:center;
              display:flex;
              word-break:break-word;
              padding-right: 26px;
          }
          .gm-style .box-card .header img{
              width: 30px!important;
              height: 30px!important;
              filter: hue-rotate(0deg) saturate(0%) brightness(100);
              margin:auto 0;
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
              flex-direction: row !important;
              max-height: 100%;
              margin-top: -15px;
          }
          .gm-style .box-card .body .name {
              font-size: 1.5rem!important;
              overflow: hidden!important;
              max-width: 100%!important;
              text-align:center;
          }
          .gm-style .box-card .body .infoGeneral {
              font-size: 1.3rem!important;
              color: #333333!important;
              overflow: hidden!important;
              margin: 0!important;
              max-width: 100%!important;
              font-weight:normal;
          }
          .gm-style .box-card .body .infoTitle{
              font-size: 1.3rem!important;
              overflow: hidden!important;
              margin: 0!important;
              max-width: 100%!important;
              font-weight:bold;
              text-align:left;
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
          .gm-style .box-card .body .infoGeneral.line {
              border-bottom:1px solid grey;
              padding-bottom:10px;
              margin-bottom:10px!important;
          }

          .gm-style .box-card .body .icon-estacion {
            width: 15% !important;
            display: flex !important;
            align-items: center !important;
            align-content: center;
            justify-content: center;
            margin: 0px 5px 5px -5px;
          }

          .gm-style .box-card .body .content-estacion {
            width:80% !important;
            padding-left: 2%;
            overflow:hidden;
          }

          .gm-style .box-card .body .content-estacion h1{
            margin-top: 0px !important;
            font-size: 2.2rem !important;
          }

          .gm-style .box-card .body .content-estacion p{
            font-size: 1.3rem;
          }

          .gm-style .box-card .body .content-estacion #detail{
            font-size:1rem;
            color: #006fac;
          }
      </style>

          <div class="box-card infoContainer" >
              <div class="header">
                  <div class="buttonsi">
                      <div id="closeInfoWindow" icon-only=""  class="buttoni disable-hover bar-button bar-button-ios bar-button-default bar-button-default-ios">
                          <span class="button-inner">
                              <ion-icon name="close" role="img" class="icon icon-ios ion-ios-close" aria-label="close"></ion-icon>
                          </span>
                          <div class="button-effect"></div>
                      </div>
                  </div>
                </div>
              <div class="body" id="infoContainer">
                <div class="icon-estacion"><img src="${icono_estacion}" width="40px" height="40px"></div>
                <div class="content-estacion">
                  <h1>${titulo}</h1>
                  <p style="margin-top:-8px;">${content}</p>
                </div>
            </div>
            <div class="punta"></div>
          </div>
        `;
    }

    // traer informacion de marker para mostrar info window
    public static getGeometryInfoAndShowInfoWindow(
        marker: any,
        provider: any
    ): void {
        this.layerProvider = provider;
        this.getMarkerInfoSubscription = this.layerProvider
            .getMarkerInfo(marker['id'])
            .subscribe(
                (response: any) => {
                    this.agregarInfoCicloParqueadero(
                        marker,
                        JSON.parse(response._body)
                    );
                },
                (error: any) => {
                    console.log(
                        ' getGeometryInfoAndShowInfoWindow getMarkerInfo error ' +
                            JSON.stringify(error)
                    );
                }
            );
    }

    private static setContenInfoWindows(
        contentData: any,
        isCicloParqueadero?: boolean
    ) {
        let icono_estacion;
        let titulo;
        let content;

        if (isCicloParqueadero) {
            console.log('DataCicloParqueadero', contentData);
            // icono_estacion = contentData.rutaImagen;
            icono_estacion =
                'assets/movilidad/markers/markercicloparqueadero.svg';
            titulo = 'Cicloparqueadero';
            content = contentData.nombre;
        } else {
            icono_estacion = this.obtenerIconoInfoWindow(contentData);
            titulo = this.obtenerTituloInfoWindows(contentData);
            content = this.parseContentInfoWindow(contentData);
        }

        this.contentInfoWindow = `
      <style>
        .gm-style-iw {
            height: 170px !important;
            width:100%!important;
            max-width:100%!important;
            max-height:170px!important;
            min-height: 86px !important;
        }
        .gm-style .gm-style-iw {
            display: contents!important;
        }
        .gm-style .gm-style-iw-c {
            background-color:transparent!important;
            box-shadow:none!important;
            overflow: visible!important;
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
            color: grey;

        }
        .gm-style .buttonsi .buttoni .button-inner{
            margin-right:15px;
            margin-top: -10px;

}
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
            max-width: 90%!important;
            width:90%!important;
            max-height: 100px!important;
            position: absolute!important;
            bottom: 10px!important;
            left: -45%!important;
            min-height: 70px;
            height: auto;
        }
        .content-ios .gm-style .box-card {

        }
        .gm-style .box-card .header {
            width: 100%!important;
            height:10px!important;
            border-radius:6px 6px 0 0!important;
            color:#ffffff;
            padding:10px 5px;
            text-align:center;
            display:flex;
            word-break:break-word;
            padding-right: 26px;
        }
        .gm-style .box-card .header img{
            width: 30px!important;
            height: 30px!important;
            filter: hue-rotate(0deg) saturate(0%) brightness(100);
            margin:auto 0;
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
            flex-direction: row !important;
            max-height: 100%;
            margin-top: -15px;
        }
        .gm-style .box-card .body .name {
            font-size: 1.5rem!important;
            overflow: hidden!important;
            max-width: 100%!important;
            text-align:center;
        }
        .gm-style .box-card .body .infoGeneral {
            font-size: 1.3rem!important;
            color: #333333!important;
            overflow: hidden!important;
            margin: 0!important;
            max-width: 100%!important;
            font-weight:normal;
        }
        .gm-style .box-card .body .infoTitle{
            font-size: 1.3rem!important;
            overflow: hidden!important;
            margin: 0!important;
            max-width: 100%!important;
            font-weight:bold;
            text-align:left;
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
        .gm-style .box-card .body .infoGeneral.line {
            border-bottom:1px solid grey;
            padding-bottom:10px;
            margin-bottom:10px!important;
        }

        .gm-style .box-card .body .icon-estacion {
          width: 15% !important;
          display: flex !important;
          align-items: center !important;
          align-content: center;
          justify-content: center;
          margin: 0px 5px 5px -5px;
        }

        .gm-style .box-card .body .content-estacion {
          width:80% !important;
          padding-left: 2%;
          overflow:hidden;
        }

        .gm-style .box-card .body .content-estacion h1{
          margin-top: 0px !important;
          font-size: 2.2rem !important;
        }

        .gm-style .box-card .body .content-estacion p{
          font-size: 1.3rem;
        }

        .gm-style .box-card .body .content-estacion #detail{
          font-size:1rem;
          color: #006fac;
        }
    </style>

        <div class="box-card infoContainer" >
            <div class="header">
                <div class="buttonsi">
                    <div id="closeInfoWindow" icon-only=""  class="buttoni disable-hover bar-button bar-button-ios bar-button-default bar-button-default-ios">
                        <span class="button-inner">
                            <ion-icon name="close" role="img" class="icon icon-ios ion-ios-close" aria-label="close"></ion-icon>
                        </span>
                        <div class="button-effect"></div>
                    </div>
                </div>
              </div>
            <div class="body" id="infoContainer">
              <div class="icon-estacion"><img src="${icono_estacion}" width="40px" height="40px"></div>
              <div class="content-estacion">
                <h1>${titulo}</h1>
                <p style="margin-top:-8px;">${content} <br> <span  id="detail" >Detalle...</span></p>
              </div>
          </div>
          <div class="punta"></div>
        </div>
      `;
    }

    public static codificarDireccion(data: any, modo: string): Promise<any> {
        const geocoder = new google.maps.Geocoder();
        let config: any;

        const defaultBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(6.075967, -75.633433),
            new google.maps.LatLng(6.450092, -75.323971)
        );

        if (modo === 'location') {
            config = { location: data, bounds: defaultBounds, region: 'CO' };
        } else {
            config = { address: data, bounds: defaultBounds, region: 'CO' };
        }
        return new Promise((resolve, reject) => {
            geocoder.geocode(config, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK) {
                    const dataLoc = {
                        latitud: results[0].geometry.location.lat(),
                        longitud: results[0].geometry.location.lng(),
                        descripcion: results[0].formatted_address
                    };

                    resolve(dataLoc);
                } else {
                    console.error(
                        'GmapsMovilidad:codificarDireccion-error',
                        status
                    );
                    reject(status);
                }
            });
        });
    }

    public static crearCoordendasRuta(cooredenadasResponse: any[]): any {
        const coordenadasRuta = [];
        for (
            let index = 0;
            index < cooredenadasResponse.length;
            index++, index++
        ) {
            const lat = +cooredenadasResponse[index];
            const lng = +cooredenadasResponse[index + 1];
            coordenadasRuta.push({ lat, lng });
        }
        return coordenadasRuta;
    }

    public static renderPoint(result: any, polyline: any): any {
        let flightPath;
        const caminando = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 4
        };

        switch (polyline) {
            case 'caminar': {
                flightPath = new google.maps.Polyline({
                    path: result,
                    geodesic: true,
                    icons: [
                        {
                            icon: caminando,
                            offset: '0',
                            repeat: '20px'
                        }
                    ],
                    strokeOpacity: 0,
                    strokeColor: '#0060B6',
                    strokeWeight: 1
                });
                break;
            }
            case 'cicloruta': {
                flightPath = new google.maps.Polyline({
                    path: result,
                    geodesic: true,
                    strokeColor: '#FF9C04',
                    strokeOpacity: 0.5,
                    strokeWeight: 3.3
                });
                break;
            }

            case 'bici-particular': {
                flightPath = new google.maps.Polyline({
                    path: result,
                    geodesic: true,
                    strokeColor: '#FF000F',
                    strokeOpacity: 0.5,
                    strokeWeight: 3.3
                });
                break;
            }
            case 'bus': {
                flightPath = new google.maps.Polyline({
                    path: result,
                    geodesic: true,
                    strokeColor: '#1717D3',
                    strokeOpacity: 0.5,
                    strokeWeight: 3.3
                });
                break;
            }
            case 'bus-integrado': {
                flightPath = new google.maps.Polyline({
                    path: result,
                    geodesic: true,
                    strokeColor: '#3bbe98',
                    strokeOpacity: 0.5,
                    strokeWeight: 3.3
                });
                break;
            }

            case 'bus-alimentador': {
                flightPath = new google.maps.Polyline({
                    path: result,
                    geodesic: true,
                    strokeColor: '#FFFB00',
                    strokeOpacity: 0.5,
                    strokeWeight: 3.3
                });
                break;
            }
            case 'metrocable': {
                flightPath = new google.maps.Polyline({
                    path: result,
                    geodesic: true,
                    strokeColor: '#5d6a9c',
                    strokeOpacity: 0.5,
                    strokeWeight: 3.3
                });
                break;
            }
            case 'tranvia': {
                flightPath = new google.maps.Polyline({
                    path: result,
                    geodesic: true,
                    strokeColor: '#5db8ff',
                    strokeOpacity: 0.5,
                    strokeWeight: 3.3
                });
                break;
            }
            case 'metroplus': {
                flightPath = new google.maps.Polyline({
                    path: result,
                    geodesic: true,
                    strokeColor: '#3b897f',
                    strokeOpacity: 0.5,
                    strokeWeight: 3.3
                });
                break;
            }

            case 'metro': {
                flightPath = new google.maps.Polyline({
                    path: result,
                    geodesic: true,
                    strokeColor: '#00D20D',
                    strokeOpacity: 0.5,
                    strokeWeight: 3.3
                });
                break;
            }

            case 'ENCICLA': {
                flightPath = new google.maps.Polyline({
                    path: result,
                    geodesic: true,
                    strokeColor: '#0060b6',
                    strokeOpacity: 0.8,
                    strokeWeight: 3.3
                });
                break;
            }
        }
        flightPath.setMap(MapService.map);
        return flightPath;
    }

    public static obtenerTransporte(polyline: any): any {
        const modoTransporte = {
            color: '',
            imagen: ''
        };

        switch (polyline) {
            case 'WALK': {
                modoTransporte.imagen =
                    'https://area247.metropol.gov.co/api/icono/2179';
                modoTransporte.color = '#0060B6';
                break;
            }
            case 'CABLE_CAR': {
                // 'Ciclo ruta
                modoTransporte.imagen =
                    'assets/movilidad/iconos/enCiclaIcon.svg';
                modoTransporte.color = '#FF9C04';
                break;
            }

            case 'BICYCLE': {
                modoTransporte.imagen =
                    'assets/movilidad/iconos/enCiclaIcon.svg';
                modoTransporte.color = '#FF000F';
                break;
            }
            case 'SUBWAY': {
                // 'BUSES GTPC
                modoTransporte.imagen = 'assets/movilidad/iconos/bus.svg';
                modoTransporte.color = '#1717D3';
                break;
            }
            case 'FUNICULAR': {
                // 'integrado
                modoTransporte.imagen = 'assets/movilidad/iconos/integrado.svg';
                modoTransporte.color = '#3bbe98';
                break;
            }

            case 'FERRY': {
                // alimentador
                modoTransporte.imagen = 'assets/movilidad/iconos/integrado.svg';
                modoTransporte.color = '#FFFB00';
                break;
            }
            case 'GONDOLA': {
                modoTransporte.imagen =
                    'assets/movilidad/iconos/metrocable.svg';
                modoTransporte.color = '#5d6a9c';
                break;
            }
            case 'TRAM': {
                modoTransporte.imagen = 'assets/movilidad/iconos/tranvia.svg';
                modoTransporte.color = '#5db8ff';
                break;
            }
            case 'BUS': {
                // Metro PLUS

                modoTransporte.imagen = 'assets/movilidad/iconos/metroplus.svg';
                modoTransporte.color = '#3b897f';
                break;
            }

            case 'RAIL': {
                modoTransporte.imagen = 'assets/movilidad/iconos/metro.svg';
                modoTransporte.color = '#00D20D';
                break;
            }
        }
        return modoTransporte;
    }

    public static obtenerIconoMarker(data: any): string {
        let icono = '';

        if (data.idEstacion || data.idEstacion == null) {
            if (data.idModoEstacion === 2) {
                icono = 'https://area247.metropol.gov.co/api/icono/2303';
            }

            if (data.idModoEstacion === 6) {
                icono = 'https://area247.metropol.gov.co/api/icono/2171';
            }

            if (data.idModoEstacion === 3) {
                icono = 'https://area247.metropol.gov.co/api/icono/2172';
            }

            if (data.idModoEstacion === 0) {
                icono = 'https://area247.metropol.gov.co/api/icono/2173';
            }

            if (data.idModoEstacion === 5) {
                icono = 'https://area247.metropol.gov.co/api/icono/2324';
            }
        }

        if (data.codigoParadero) {
            icono = 'https://area247.metropol.gov.co/api/icono/2280';
        }

        if (data.idPunto) {
            if (data.tipoPunto === 'R') {
                icono = 'https://area247.metropol.gov.co/api/icono/2305';
            } else {
                icono = 'https://area247.metropol.gov.co/api/icono/2305';
            }
        }

        if (data.nombreModoEstacion === ModoEstacion.ENCICLA) {
            icono = 'https://area247.metropol.gov.co/api/icono/2324';
        }

        return icono;
    }

    public static obtenerIconoInfoWindow(data: any): string {
        let icono = '';

        if (data.idEstacion || data.idEstacion == null) {
            if (data.idModoEstacion === 2) {
                icono = 'https://area247.metropol.gov.co/api/icono/2303';
            }

            if (data.idModoEstacion === 6) {
                icono = 'https://area247.metropol.gov.co/api/icono/2171';
            }

            if (data.idModoEstacion === 3) {
                icono = 'https://area247.metropol.gov.co/api/icono/2172';
            }

            if (data.idModoEstacion === 0) {
                icono = 'https://area247.metropol.gov.co/api/icono/2173';
            }

            if (data.idModoEstacion === 5) {
                icono = 'https://area247.metropol.gov.co/api/icono/2324';
            }
        }

        if (data.codigoParadero) {
            icono = 'https://area247.metropol.gov.co/api/icono/2280';
        }

        if (data.idPunto) {
            if (data.tipoPunto === 'R') {
                icono = 'https://area247.metropol.gov.co/api/icono/2305';
            } else {
                icono = 'https://area247.metropol.gov.co/api/icono/2305';
            }
        }

        if (data.nombreModoEstacion === ModoEstacion.ENCICLA) {
            icono = 'https://area247.metropol.gov.co/api/icono/2324';
        }

        return icono;
    }

    public static obtenerTituloInfoWindows(data: any): string {
        let titulo = '';

        if (data.idEstacion || data.idEstacion == null) {
            if (
                data.idModoEstacion === 2 &&
                data.nombreModoEstacion === 'ENCICLA'
            ) {
                titulo = 'Estación EnCicla';
            } else {
                titulo = 'Estación Metro';
            }

            if (data.idModoEstacion === 1) {
                titulo = 'Estación Autobus';
            }

            if (data.idModoEstacion === 0) {
                titulo = 'Estación Tranvia';
            }

            if (data.idModoEstacion === 6) {
                titulo = 'Estación Metrocable';
            }

            if (data.idModoEstacion === 3) {
                titulo = 'Estación Metroplús';
            }
        }

        if (data.codigoParadero) {
            titulo = 'Paradero Bus';
        }

        if (data.codigoRuta) {
            titulo = 'Ruta Bus';
        }

        if (data.idModoLinea) {
            titulo = 'Linea Metro';
        }

        if (data.idCiclovia) {
            titulo = 'Cicloruta';
        }

        if (data.idPunto) {
            if (data.tipoPunto === 'R') {
                titulo = 'Recarga Cívica';
            } else {
                titulo = 'Expedición Cívica';
            }
        }
        return titulo;
    }

    private static parseContentInfoWindow(data) {
        let descripcion = '';
        if (data.idEstacion || data.idEstacion == null) {
            if (data.idModoEstacion === 6) {
                descripcion = `${data.descripcion} - ${data.descripcion}`;
            }

            if (
                data.idModoEstacion === 2 &&
                data.nombreModoEstacion === 'ENCICLA'
            ) {
                descripcion = `${data.nombre}`;
            } else if (data.idModoEstacion === 2) {
                const desc = data.direccion || data.descripcionLinea;
                descripcion = `${data.descripcion} - ${desc}`;
            }

            if (data.idModoEstacion === 3) {
                descripcion = `${data.descripcion} - ${data.descripcionLinea}`;
            }

            if (data.idModoEstacion === 1) {
                descripcion = 'data.descripcion';
            }

            if (data.idModoEstacion === 0) {
                descripcion = `${data.descripcion} - ${data.descripcionLinea} `;
            }
        }

        if (data.codigoParadero) {
            descripcion = `${data.descripcion}`;
        }

        if (data.codigoRuta) {
            descripcion = `Ruta Bus`;
        }

        if (data.idPunto) {
            descripcion = `${data.descripcion}`;
        }
        return descripcion;
    }

    public static mostrarRuta(ruta: any, modoTransporte: string) {
        const coordenadasRuta = GmapsMovilidadService.crearCoordendasRuta(
            ruta.coordenadas
        );

        console.log('coordenadas', coordenadasRuta);

        ruta.flightPath = this.renderPoint(coordenadasRuta, modoTransporte);

        GmapsMovilidadService.markersPolylines.push(ruta.flightPath);
        const bounds = new google.maps.LatLngBounds();

        ruta.flightPath.getPath().forEach((latLng) => {
            bounds.extend(latLng);
        });

        if (modoTransporte !== 'ENCICLA'){
            MapService.map.fitBounds(bounds);
            this.agregarInfoRuta(ruta.flightPath, ruta);
        }
    }

    public static ocultarRuta(ruta) {
        if (ruta.flightPath) {
            ruta.flightPath.setMap(null);
        } else {
            if (ruta.setMap) {
                ruta.setMap(null);
            }
        }
    }

    public static ocultarMarkersRuta(ruta) {
      for (const markerPolyline of this.markersPolylines) {
        const element = markerPolyline;
        if (element.idRuta) {
          if (
              element.idRuta === ruta.idRuta ||
              element.idRuta === ruta.idLinea
          ) {
              element.setMap(null);
          }
        }
      }
    }

    public static ocultarRutas(rutas) {
      for (const ruta of rutas) {
        if (ruta.flightPath) {
          ruta.flightPath.setMap(null);
        }
      }
    }

    public static agregarInfoParadero(
        marker: any,
        isMarkerWithoutDetail?: boolean
    ) {
        google.maps.event.addListener(
            marker,
            'click',
            ((markerX, me) => {
                return () => {
                    if (isMarkerWithoutDetail) {
                        GmapsMovilidadService.crearInfoWindow(
                            markerX.dataRutaCercana,
                            markerX,
                            isMarkerWithoutDetail
                        );
                    } else {
                        GmapsMovilidadService.crearInfoWindow(
                            markerX.dataRutaCercana,
                            markerX
                        );
                    }
                };
            })(marker, this)
        );
    }

    static agregarInfoCicloParqueadero(marker: any, data) {
        GmapsMovilidadService.crearInfoWindow(data, marker, false, true);
    }

    public static agregarInfoRuta(ruta: any, data: any) {
        let latlng;

        ruta.addListener('click', (polyMouseEvent) => {
            latlng = {
                lat: polyMouseEvent.latLng.lat(),
                lng: polyMouseEvent.latLng.lng()
            };

            GmapsMovilidadService.crearInfoWindow(data, ruta);

            GmapsMovilidadService.centrarInfoWindow(latlng);
            ruta.setOptions({ strokeOpacity: 1.0 });
        });

        ruta.addListener('mouseout', (polyMouseEvent) => {
            ruta.setOptions({ strokeOpacity: 0.5 });
        });
    }

    public static obtenerModoTransporte(objeto: any): string {
        let modoTransporte = '';
        if (objeto.codigoRuta) {
            modoTransporte = 'bus';
        }

        if (objeto.idLinea) {
            modoTransporte = 'metro';
        }

        if (objeto.idCiclovia) {
            modoTransporte = 'cicloruta';
        }

        return modoTransporte;
    }

    public static createPositionMarkerWithoutRadius(
        lat: number,
        lng: number
    ): void {
        const position: google.maps.LatLng = new google.maps.LatLng(lat, lng);
        if (this.locationMarker) {
            this.locationMarker.setPosition(position);
            this.locationMarker.setMap(MapService.map);
            MapService.map.setZoom(15);
            this.locationMarker.setMap(null);
            this.locationMarker = null;
            this.locationMarker = new google.maps.Marker({
                map: MapService.map,
                position,
                icon: {
                    scaledSize: new google.maps.Size(50, 50),
                    url: 'assets/mapa/ubicacion.svg'
                },
                animation: google.maps.Animation.DROP,
                draggable: true,
                zIndex: google.maps.Marker.MAX_ZINDEX + 1
            });
            MapService.map.setZoom(15);

            google.maps.event.addListener(
                this.locationMarker,
                'dragend',
                (event: any) => {
                    MapaComponent.emitDragedNoRadiusPedestrian({
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng()
                    });
                }
            );
        } else {
            this.locationMarker = new google.maps.Marker({
                map: MapService.map,
                position,
                icon: {
                    scaledSize: new google.maps.Size(50, 50),
                    url: 'assets/mapa/ubicacion.svg'
                },
                animation: google.maps.Animation.DROP,
                draggable: true,
                zIndex: google.maps.Marker.MAX_ZINDEX + 1
            });
            google.maps.event.addListener(
                this.locationMarker,
                'dragend',
                (event: any) => {
                    MapaComponent.emitDragedNoRadiusPedestrian({
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng()
                    });
                }
            );
        }
    }

    public static createUpdatePositionMarker(lat: number, lng: number): void {
        const position: google.maps.LatLng = new google.maps.LatLng(lat, lng);
        const actionRadius = GmapsMovilidadService.obtenerRadio();
        if (this.locationMarker) {
            this.locationMarker.setPosition(position);
            this.locationMarker.setMap(MapService.map);
            MapService.map.setZoom(15);
            if (this.actionRadiusCircle !== undefined) {
                this.actionRadiusCircle.setMap(MapService.map);
                this.actionRadiusCircle.setCenter(position);
            } else {
                this.locationMarker.setMap(null);
                this.locationMarker = null;
                this.locationMarker = new google.maps.Marker({
                    map: MapService.map,
                    position,
                    icon: {
                        scaledSize: new google.maps.Size(50, 50),
                        url: 'assets/mapa/ubicacion.svg'
                    },
                    animation: google.maps.Animation.DROP,
                    draggable: true,
                    zIndex: google.maps.Marker.MAX_ZINDEX + 1
                });
                MapService.map.setZoom(15);

                this.actionRadiusCircle = new google.maps.Circle({
                    map: MapService.map,
                    radius: actionRadius,
                    fillColor: '#f9bbbb',
                    strokeColor: '#f9bbbb',
                    strokeOpacity: 0.3,
                    strokeWeight: 0.8,
                    fillOpacity: 0.1
                });

                google.maps.event.addListener(
                    this.locationMarker,
                    'dragend',
                    (event: any) => {
                        MapaComponent.emitDragedPedestrian({
                            lat: event.latLng.lat(),
                            lng: event.latLng.lng()
                        });
                    }
                );

                this.actionRadiusCircle.bindTo(
                    'center',
                    this.locationMarker,
                    'position'
                );
            }
        } else {
            this.locationMarker = new google.maps.Marker({
                map: MapService.map,
                position,
                icon: {
                    scaledSize: new google.maps.Size(50, 50),
                    url: 'assets/mapa/ubicacion.svg'
                },
                animation: google.maps.Animation.DROP,
                draggable: true,
                zIndex: google.maps.Marker.MAX_ZINDEX + 1
            });

            this.actionRadiusCircle = new google.maps.Circle({
                map: MapService.map,
                radius: actionRadius,
                fillColor: '#f9bbbb',
                strokeColor: '#f9bbbb',
                strokeOpacity: 0.3,
                strokeWeight: 0.8,
                fillOpacity: 0.1
            });

            google.maps.event.addListener(
                this.locationMarker,
                'dragend',
                (event: any) => {
                    MapaComponent.emitDragedPedestrian({
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng()
                    });
                }
            );
            this.actionRadiusCircle.bindTo(
                'center',
                this.locationMarker,
                'position'
            );
        }
    }

    public static createPositionMarker(ubicacion: Ubicacion) {
        const position: google.maps.LatLng = new google.maps.LatLng(
            ubicacion.latitud,
            ubicacion.longitud
        );
        if (this.locationMarker) {
            this.locationMarker.setPosition(position);
            this.locationMarker.setMap(MapService.map);
        } else {
            this.locationMarker = new google.maps.Marker({
                map: MapService.map,
                position,
                icon: {
                    scaledSize: new google.maps.Size(50, 50),
                    url: 'assets/mapa/ubicacion.svg'
                },
                animation: google.maps.Animation.DROP,
                draggable: false,
                zIndex: google.maps.Marker.MAX_ZINDEX + 1
            });

            // MapProvider.map.setZoom(15)
        }
    }

    public static deletePositionMarker() {
        if (this.locationMarker) {
            this.locationMarker.setMap(null);
            this.locationMarker = null;
        }
    }

    public static updateGraphicRadius(radio: number) {
        this.actionRadiusCircle.setRadius(radio);
    }

    public static deleteLocationMarker() {
        if (this.locationMarker) {
            this.locationMarker.setMap(null);
            this.actionRadiusCircle.setMap(null);
            this.locationMarker = null;
            this.actionRadiusCircle = null;
        }
    }
}
