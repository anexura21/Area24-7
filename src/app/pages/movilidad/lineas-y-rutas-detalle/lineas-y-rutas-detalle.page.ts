import { UtilsMovilidadService } from './../../../providers/movilidad/utils-movilidad.service';
import { GmapsMovilidadService } from './../../../providers/movilidad/gmaps-movilidad.service';
import { ActivatedRoute } from '@angular/router';
import { OtherLayer } from './../../../entities/other-layer';
import { NavController } from '@ionic/angular';
import { MessageService } from './../../../providers/message.service';
import { TranslateService } from '@ngx-translate/core';
import { Common } from './../../../shared/utilidades/common.service';
import { WsMovilidadService } from './../../../providers/movilidad/ws-movilidad.service';
import { RutasLineasResponse } from './../../../entities/rutas-lineas-response';
import { AppLayer } from './../../../entities/app-layer';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lineas-y-rutas-detalle',
  templateUrl: './lineas-y-rutas-detalle.page.html',
  styleUrls: ['./lineas-y-rutas-detalle.page.scss'],
})
export class LineasYRutasDetallePage implements OnInit {

  criterioBusqueda: any;
  mostrarRutasLineas = false;
  autocompleteItems: any[];

  titulo: string;

  showDetalle: boolean;
  rutasLineas: any = [];
  imgDetalle: any;
  txtDetalle: any;
  checked = false;
  rutasLineasResponse: RutasLineasResponse;
  convertTime24to12 = UtilsMovilidadService.convertTime24to12;

  rutas: any = [];
  lineas: any = [];
  markers: any = [];


  public rutasActive = false;
  public lineasActive = false;
  public appLayer: AppLayer;

  // @ViewChild(Navbar) navBar: Navbar;

  constructor(public navCtrl: NavController,
              public wsMovilidad: WsMovilidadService,
              private utilidades: Common,
              private translateService: TranslateService,
              private messageProvider: MessageService,
              private route: ActivatedRoute) {
                console.log('init detalle lineas y rutas');

                this.mostrarRutasLineas = true;
                this.showDetalle = false;
                this.autocompleteItems = [];

                let data;
                this.route.params.subscribe( params => {
                  data = params['data'];
                  this.appLayer = params['appLayer'];
                  this.criterioBusqueda = params['criterio'];
                });
                this.rutasLineasResponse = data as RutasLineasResponse;
                console.log(this.rutasLineasResponse);
                this.titulo = this.appLayer.children.find((layer: OtherLayer) => layer.layerType === 'MAPA DE LÍNEAS Y RUTAS').name;
               }

  ionViewDidLoad() {
  }

  ngOnInit() {
    this.showDetalleAuto();
  }


  private showDetalleAuto(){
    if (this.rutasLineasResponse.lineas !== undefined && this.rutasLineasResponse.lineas.length > 0){
      this.onClickRutasLineas(1)
    }

    if (this.rutasLineasResponse.rutas !== undefined && this.rutasLineasResponse.rutas.length > 0){
      this.onClickRutasLineas(0)
    }
  }

  ionViewWillLeave() {
    this.limpiarMarkers();
    GmapsMovilidadService.ocultarRutas(this.rutasLineasResponse.lineas);
    GmapsMovilidadService.ocultarRutas(this.rutasLineasResponse.rutas);
  }


  limpiarMarkers(){
    if(this.markers.length > 0){
      for (const marker of this.markers) {
        marker.setMap(null);
      }
    }

  }

  onObtenerRutasLineas(data: any) {
    this.wsMovilidad.obtenerRutasyLineas(data)
      .subscribe(
        (succces: any) => {
          this.autocompleteItems = [];
          this.limpiarMarkers();

          if (succces.codigo === 1) {
            if (this.rutasLineasResponse) {
              GmapsMovilidadService.ocultarRutas(this.rutasLineasResponse.lineas);
              GmapsMovilidadService.ocultarRutas(this.rutasLineasResponse.rutas);
            }
            this.rutasLineasResponse = succces as RutasLineasResponse;
            this.mostrarRutasLineas = true;
            this.showDetalle = false;
            this.rutasActive = false;
            this.lineasActive = false;
            this.showDetalleAuto();
            console.log(this.rutasLineasResponse)
          } else {
            if (succces.codigo === 2) {
              this.messageProvider.getByNombreIdentificador('no_resultados').subscribe(
                (response: any): void => {
                    const msg = response;
                    this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                }
              );
              this.showDetalle = false;
              this.rutasActive = false;
              this.lineasActive = false;
            }
          }

          this.showDetalle = true;
          this.utilidades.dismissLoading();

        },
        error => {
          this.messageProvider.getByNombreIdentificador('inconveniente_movilidad').subscribe(
            (response: any): void => {
                const msg = response;
                this.utilidades.basicAlert(msg.titulo, msg.descripcion)
                this.utilidades.dismissLoading();
            }
          );
        }
      );
  }

  onClickRutasLineas(tipo: number) {
    this.autocompleteItems = [];
    this.rutasLineas = [];
    this.txtDetalle = 'Detalle';
    if (tipo === 0){
      this.rutasActive = !this.rutasActive;
    }else if (tipo === 1){
      this.lineasActive = !this.lineasActive;
    }

    if(this.lineasActive){
      if(this.rutasLineasResponse.lineas.length === 0){
        this.messageProvider.getByNombreIdentificador('no_resultados').subscribe(
          (response: any): void => {
              const msg = response.json();
              this.utilidades.basicAlert(msg.titulo, msg.descripcion);
              this.utilidades.dismissLoading();
          }
        );
        this.lineasActive = false;
      }else{
        this.rutasLineasResponse.lineas.map((element) => {

          this.rutasLineas.push(element);
        })
      }
    }


    if (this.rutasActive){
      if (this.rutasLineasResponse.rutas.length === 0){
        this.rutasActive = false;
        this.messageProvider.getByNombreIdentificador('no_resultados').subscribe(
          (response: any): void => {
              const msg = response.json();
              this.utilidades.basicAlert(msg.titulo, msg.descripcion)
              this.utilidades.dismissLoading();
          }
        );

      }else{
        this.rutasLineasResponse.rutas.map((element) => {
              this.rutasLineas.push(element);
        });
      }
    }
    this.showDetalle = true;

    if (!this.rutasActive && !this.lineasActive){
      this.showDetalle = false;
    }
  }

  checkMostrarRuta(event, ruta) {
    if (event.checked) {
      const modoTransporte = GmapsMovilidadService.obtenerModoTransporte(ruta);
      GmapsMovilidadService.mostrarRuta(ruta, modoTransporte);
      ruta.checked = true;
    } else {
      GmapsMovilidadService.ocultarRuta(ruta);
      ruta.checked = false;
    }
  }

  mostrarRuta(event) {
    if (event.visible) {
      this.showDetalle = false;
      this.rutasActive = false;
      this.lineasActive = false;
    }

    // for (let i = 0; i < event.markers.length; i++) {
    for ( const marker of event.markers ) {
      this.markers.push(marker);
    }
  }


  actualizarListado() {
    if (this.criterioBusqueda === '') {
      this.autocompleteItems = [];

      return;
    }
    this.onObtenerRutasyLineasAutocompletado(this.criterioBusqueda);
  }


  onKeyEnterRutaLinea(event: any) {
    if (event.keyCode === 13) {
      this.seleccionarItem(this.criterioBusqueda, 2);
    }
  }

  seleccionarItem(item: any, tipo: number) {
    this.utilidades.presentLoading();
    //
    if (tipo === 1) {
      this.criterioBusqueda = item.descripcion;
      this.onObtenerRutaLineaDetalle(item.tipo, item.id);
    } else {
      this.onObtenerRutasLineas(this.criterioBusqueda);
    }
  }

    clickObtenerRutasLineas() {
    if (this.criterioBusqueda.trim().length > 0) {
      this.utilidades.presentLoading();
      this.onObtenerRutasLineas(this.criterioBusqueda);
    } else {

      this.messageProvider.getByNombreIdentificador('busqueda_campo').subscribe(
        (response: any): void => {
            const msg = response;
            this.utilidades.basicAlert(msg.titulo, msg.descripcion);
            this.utilidades.dismissLoading();
        }
      );
    }

  }

  onObtenerRutasyLineasAutocompletado(criterio: any) {
    this.wsMovilidad
      .obtenerRutasyLineasAutocompletado(criterio)
      .subscribe(
        (succces: any) => {
          this.autocompleteItems = [];
          this.autocompleteItems = succces;
        },
        error => {
          this.autocompleteItems = [];
        }
      );
  }

  onObtenerRutaLineaDetalle(tipo: any, id: any) {
    this.wsMovilidad
      .obtenerRutaLineaDetalle(tipo, id)
      .subscribe(
        (succces: any) => {

          console.log('Seleccionar item', succces);

          this.autocompleteItems = [];
          this.limpiarMarkers();
          this.utilidades.dismissLoading();

          if (this.rutasLineasResponse) {
            GmapsMovilidadService.ocultarRutas(this.rutasLineasResponse.lineas);
            GmapsMovilidadService.ocultarRutas(this.rutasLineasResponse.rutas);
          }

          const data = new RutasLineasResponse();

          if (succces.linea != null) {
            const lineas = [];
            lineas.push(succces.linea);
            data.lineas = lineas;
            data.rutas = [];
          } else {
            const rutas = [];
            rutas.push(succces.ruta);
            data.rutas = rutas;
            data.lineas = [];
          }

          this.rutasLineasResponse = data;
          console.log(this.rutasLineasResponse);
          this.mostrarRutasLineas = true;
          this.showDetalle = false;
          this.rutasActive = false;
          this.lineasActive = false;
          this.showDetalleAuto();
        },
        error => {
          this.messageProvider.getByNombreIdentificador('inconveniente_movilidad').subscribe(
            (response: any): void => {
                const msg = response.json();
                this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                this.utilidades.dismissLoading();
            }
          );
        }
      );
  }

  onFocusSearchBar() {
    // document.getElementById('gridLineasRutas').classList.add("no-scroll");
    document.body.classList.add('no-scroll');
  }

  onBlurSearchBar() {
    // document.getElementById('gridLineasRutas').classList.remove("no-scroll");
    document.body.classList.remove('no-scroll');
  }

  clearSearch(event: any){
    this.showDetalleAuto();
    this.criterioBusqueda = '';
  }

}
