import { OtherLayerComponent } from 'src/app/components/other-layer/other-layer.component';
import { Router, ActivatedRoute } from '@angular/router';
import { OtherLayer } from './../../../entities/other-layer';
import { LayerService } from './../../../providers/layer.service';
import { MessageService } from './../../../providers/message.service';
import { TranslateService } from '@ngx-translate/core';
import { WsMovilidadService } from './../../../providers/movilidad/ws-movilidad.service';
import { Common } from './../../../shared/utilidades/common.service';
import { GooglemapsService } from './../../../providers/googlemaps.service';
import { NavController } from '@ionic/angular';
import { Ubicacion } from './../../../entities/movilidad/ubicacion.model';
import { AppLayer } from './../../../entities/app-layer';
import { RutasLineasResponse } from './../../../entities/rutas-lineas-response';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'lineas-y-rutas-mapa',
  templateUrl: './lineas-y-rutas-mapa.page.html',
  styleUrls: ['./lineas-y-rutas-mapa.page.scss'],
})
export class LineasYRutasMapaPage implements OnDestroy {

  ubicacion?: Ubicacion;
  titulo: string;
  public criterioBusqueda: any;
  public autocompleteItems: any[];

  public app: any;
  public rutasLineasResponse: RutasLineasResponse;
  public showDetalle: boolean;
  public appLayer: AppLayer;
  public appId;

  constructor(public navCtrl: NavController,
              public googleMaps: GooglemapsService,
              public utilidades: Common,
              public wsMovilidad: WsMovilidadService,
              private messageProvider: MessageService,
              private layerProvider: LayerService,
              private route: ActivatedRoute,
              private router: Router) {
                console.log('init LineasYRutasMapaPage');
                this.route.queryParams.subscribe( params => {
                  this.appLayer = new AppLayer(null);
                  this.titulo = params['nomApp'];
                  this.appLayer.color = params['color'];
                  this.appId = Number(params['appId']);
                });
                this.layerProvider.getMenu().subscribe(data => {
                    const apps = AppLayer.parseApps(Object.values(data));
                    this.appLayer = apps.find(app => app.id === this.appId);
                    console.log(this.appLayer);
                });
                this.autocompleteItems = [];
                this.criterioBusqueda = '';
                // this.titulo = this.appLayer.children.find((layer: OtherLayer) => layer.layerType === 'MAPA DE LÍNEAS Y RUTAS').name;
               }

    onResponseAutocompletado(data: any){
    const navOptions = {
      animate: false
    };
    const params = {
        data: data.response.data,
        criterio: data.criterioBusqueda,
        appLayer: this.appLayer
      };

    // this.navCtrl.push(LineasYRutasDetalleComponent,params, navOptions);
    this.router.navigate(['/lineas-y-rutas-detalle', { params, navOptions }]);
  }

  clickObtenerRutasLineas() {
    this.utilidades.presentLoading();
    this.onObtenerRutasLineas(this.criterioBusqueda.descripcion);
  }

  ionViewDidLeave(){
    this.utilidades.dismissLoading();
  }

  ngOnDestroy() {
    OtherLayerComponent.layerTypeCurrentlyActive = undefined;
  }


  onObtenerRutasLineas(data: any) {
    this.wsMovilidad.obtenerRutasyLineas(data)
      .subscribe(
      (succces: any) => {
        if (succces.codigo === 1) {

          this.rutasLineasResponse = succces as RutasLineasResponse;
          console.log('rutas', this.rutasLineasResponse);

          const navOptions = {
            animate: false
          };
          // this.navCtrl.push(LineasYRutasDetalleComponent, { data: succces, criterio: this.criterioBusqueda }, navOptions);
          this.router.navigate(['/lineas-y-rutas-detalle', { data: succces, criterio: this.criterioBusqueda, animate: false }]);

        } else {
          if (succces.codigo === 2) {
            this.showDetalle = false;
            this.messageProvider.getByNombreIdentificador('no_resultados').subscribe(
              (response: any): void => {
                  const msg = response;
                  this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                  this.utilidades.dismissLoading();
              }
            );
          }
        }
        this.utilidades.dismissLoading();

      },
      error => {
        console.error('LineasYRutasComponent:onObtenerRutasLineas', error);
        this.messageProvider.getByNombreIdentificador('inconveniente_movilidad').subscribe(
          (response: any): void => {
              const msg = response;
              this.utilidades.basicAlert(msg.titulo, msg.descripcion);
              this.utilidades.dismissLoading();
          }
        );
      });
  }



}
