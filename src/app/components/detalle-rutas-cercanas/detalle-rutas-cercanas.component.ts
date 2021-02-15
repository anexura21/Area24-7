import { Router } from '@angular/router';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { GmapsMovilidadService } from './../../providers/movilidad/gmaps-movilidad.service';
import { NavController, ModalController } from '@ionic/angular';
import { LocationChangeService } from './../../providers/location-change.service';
import { PosiblesViajesService } from './../../providers/posibles-viajes.service';
import { Common } from './../../shared/utilidades/common.service';
import { Ubicacion } from './../../entities/movilidad/ubicacion.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'detalle-rutas-cercanas',
  templateUrl: './detalle-rutas-cercanas.component.html',
  styleUrls: ['./detalle-rutas-cercanas.component.scss'],
})
export class DetalleRutasCercanasComponent implements OnInit {

  @Input()
  public data: any;
  public icon = '';
  public title = '';
  public lineas: [any] = [0];
  public iconClass = 'arrow-dropdown-circle';
  public showDetail = false;
  public desc: {'desc': string , id: string, 'rutas': any} = {desc: '', id: '', rutas: []};
  public isEnciclaDetail = false;
  public isrecargaDetail = false;
  public tipoEstacionEnCiclaIcon = '';
  public appContext: any;
  @Input()
  public app: any;
  @Input()
  public lat: number;
  @Input()
  public lng: number;
  public ubicacion = new Ubicacion();
  public subtitle: string;

  constructor(public common: Common,
              private posiblesViajesProvider: PosiblesViajesService,
              private navCtrl: NavController,
              private locationChange: LocationChangeService,
              private modalCtrl: ModalController,
              private route: Router) {
                this.subtitle = '';
                this.appContext = this.app;

                console.log('data', this.data);
                console.log('data latLng', this.lat, this.lng);

                this.title = this.obtenerTituloInfoWindows(this.data);

                if (this.data.nombreMunicipio){
                  this.icon = 'assets/movilidad/markers/markercicloparqueadero.svg';
                } else {
                  this.icon = GmapsMovilidadService.obtenerIconoInfoWindow(this.data);
                }
                this.ubicacion = this.data.ubicacion;
              }

  ngOnInit() {
    this.desc = this.parseData(this.data);
  }

  ionViewDidEnter(){
    if (this.data.idEstacion || this.data.idEstacion != null) {
      if (this.data.idModoEstacion === 2 && this.data.nombreModoEstacion === 'ENCICLA') {
        // titulo = "Estación EnCicla";

        if (this.data.tipoEstacion !== undefined && this.data.tipoEstacion === 'A'){
          document.getElementById('bannerIcon').classList.add('bannerAuto');
        }else if (this.data.tipoEstacion !== undefined && this.data.tipoEstacion === 'M'){
          document.getElementById('bannerIcon').classList.add('bannerManual');
        }
      }
    }
  }

  public parseData(data: any): {desc: string, id: string, rutas: any}{
    // debugger
    const detailInfo: {desc: string, id: string, rutas: any} = {desc: '', id: '', rutas: []};

    if (data.nombreMunicipio){
      detailInfo.desc = data.nombre;
      detailInfo.id = 'iconCicloParqueadero';
    }

    if (data.idEstacion || data.idEstacion != null) {
      if (data.idModoEstacion === 2 && data.nombreModoEstacion === 'ENCICLA') {
        // titulo = "Estación EnCicla";
        this.isEnciclaDetail = true;
        return detailInfo;

      }else if(data.codigoParadero !== undefined && data.idParadero >= 0) {
        detailInfo.desc = data.descripcion;
        detailInfo.rutas = data.rutas;
      }else{
        // Transportes Metro
        detailInfo.desc = `Estación ${data.descripcion}`;
        detailInfo.rutas = data.lineas;

        if (data.nombreModoEstacion === 'METRO'){
          detailInfo.id = 'iconMetro';
        }else if (data.nombreModoEstacion === 'METRO_CABLE'){
          detailInfo.id = 'iconMetroCable';
        }else if (data.nombreModoEstacion === 'TRANVIA'){
          detailInfo.id = 'iconTranvia';
        }else if (data.nombreModoEstacion === 'METRO_PLUS'){
          detailInfo.id = 'iconMetroPlus';
        }
        return detailInfo;
      }
    }

    if (data.idPunto && data.tipoPunto){
      this.isrecargaDetail = true;
      detailInfo.desc = data.descripcion;
      return detailInfo;
    }

    if (data.idRuta){
      detailInfo.desc = data.descripcion;
      detailInfo.rutas = data.rutas;
      detailInfo.id = 'iconRutas';
      return detailInfo;
    }
    return detailInfo;
  }


  public toggleDetalle(event: any){
    if (!this.showDetail){
      this.iconClass = 'arrow-dropdown-circle';
      document.getElementById(`${event}`).classList.remove('hideDetalle');
      this.showDetail = !this.showDetail;
    }else{
      this.iconClass = 'arrow-dropup-circle';
      document.getElementById(`${event}`).classList.add('hideDetalle');
      this.showDetail = !this.showDetail;
    }
  }

  public obtenerTituloInfoWindows(data: any): string {
      let titulo = '';

      if (data.nombreMunicipio){
        titulo = 'Cicloparqueadero'; // data.nombre;
      } else {
        if (data.idEstacion || data.idEstacion == null) {
          if (data.idModoEstacion === 2 && data.nombreModoEstacion === 'ENCICLA') {
            titulo = 'Estación EnCicla';
          }else{
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
            this.subtitle = 'Recarga Cívica';
          } else {
            titulo = 'Expedición Cívica';
            this.subtitle = 'Expedición Cívica';
          }

        }
      }

      return titulo;

  }

  public closeModal() {
      this.modalCtrl.dismiss();
  }


  public calcularRuta(): void{
    const origen: Geoposition = this.locationChange.getGeoposition();
    this.posiblesViajesProvider.origen = {lat: origen.coords.latitude, lon:origen.coords.longitude, descripcion: 'Mi ubicación' };
    //  this.posiblesViajesProvider.origen =  {lat:this.ubicacion.latitud, lon:this.ubicacion.longitud, descripcion:"Mi ubicación"}
    const {latitud, longitud, descripcion} = this.data;

    if (this.data.nombreMunicipio){
      this.posiblesViajesProvider.destino =
          { lat: this.lat, lon: this.lng, descripcion: this.data.nombre }
      console.log('data destino', this.posiblesViajesProvider.destino);
    } else {
      this.posiblesViajesProvider.destino = {lat: latitud, lon: longitud, descripcion}
    }

    this.posiblesViajesProvider.obtenerviajesSugeridos(true, '8,9')
    .then(data => {
        GmapsMovilidadService.deleteLocationMarker();
        data['flag_show_sidemenu'] = false;
        data['app'] = this.appContext;
        // this.navCtrl.push(VistaViajesPage, data);
        this.route.navigate(['/vista-viajes']);
    })
    .catch(error => {
      console.log(error)
    });
  }

}
