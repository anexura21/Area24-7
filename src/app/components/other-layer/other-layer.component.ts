// import { CuidameCreateComponent } from './../cuidame-create/cuidame-create.component';
import { LavergService } from './../../providers/movilidad/laverg.service';
import { CuidameDetailComponent } from './../cuidame-detail/cuidame-detail.component';
import { DecisionTreeService } from './../../providers/decision-tree.service';
import { Component, Input, OnInit } from '@angular/core';
import { LayerService } from '../../providers/layer.service';
import { AppLayer } from '../../entities/app-layer';
import { OtherLayer } from '../../entities/other-layer';
import { LayerComponent } from '../layer/layer.component';
import { APPS } from '../../shared/apps';
import { LoadingController, ModalController } from '@ionic/angular';
import { DecisionTreeComponent } from '../decision-tree/decision-tree.component';
import { NavigationExtras, Router } from '@angular/router';
import { AppAux } from 'src/app/entities/app-aux';

@Component({
  selector: 'other-layer',
  templateUrl: './other-layer.component.html',
  styleUrls: ['./other-layer.component.scss'],
})
export class OtherLayerComponent extends LayerComponent implements OnInit {

  public static layerTypeCurrentlyActive: string;

    @Input()
    layer: OtherLayer;

    app: AppLayer;

  constructor(private layerProvider: LayerService,
              private treeProvider: DecisionTreeService,
              private loadingCtrl: LoadingController,
              private modalCtrl: ModalController,
              private router: Router,
              private lavergSvc: LavergService) {
    super();
   }

  ngOnInit() {
    this.layerProvider.currentAppChange$.subscribe((app: AppLayer) => {
      this.app = app;
    });
  }

  async presentLoading() {
      const loading = await this.loadingCtrl.create({
          message: 'Un momento por favor...',
          spinner: 'bubbles'
      });
      await loading.present();
  }

  async openModalCuidameCreate() {
      console.log(this.color);
      console.log(this.app.color);
      const modal = await this.modalCtrl.create({
          component: null,
          componentProps: {
            layerId: this.layer.id,
            color: this.color,
            layer: this.layer
          }
        });
      return await modal.present();
  }

  onTapLayer(): void {
    console.log('TAG', this.layer.layerType);

    switch (this.layer.layerType) {
      case 'BACK':
          this.tapLayer.emit(this.layer);
          break;

      case 'REPORTE':
          if (this.app.id === APPS.AVISTAMIENTOS) {
              // this.navCtrl.push(AvistamientoCreateComponent, {
              //     color: this.color,
              //     layerId: this.layer.id,
              //     layer: this.layer
              // });
          } else {
              // this.navCtrl.push(CuidameCreateComponent, {
              //     color: this.color,
              //     layerId: this.layer.id,
              //     layer: this.layer
              // });
              // this.getModalCuidameCreate(this.layer, this.color, this.layer.id);

              const navigateParamsQ: NavigationExtras = {
                queryParams: {
                    layerId: this.layer.id,
                    color: this.app.color
                }
              };
              this.router.navigate([`/cuidame-create`, this.layer], navigateParamsQ);
            // this.openModalCuidameCreate();
          }
          break;

      case 'ÁRBOL':
          this.presentLoading();
          // this.common.presentLoading();
          this.treeProvider
              .getTree(this.layer.id)
              .subscribe((tree: any) => {
                     this.loadingCtrl.dismiss();
                     console.log(tree.id, this.color, this.layer.id);
                     this.getModalDecisionTree(tree.id, this.color, this.layer.id);
              });

          break;

      case 'ENCUESTA':
          // this.navCtrl.push(MidemeOptionsComponent, {
          //     color: this.color,
          //     layerId: this.layer.id,
          //     layer: this.layer
          // });
          const navigateParamsL: NavigationExtras = {
            queryParams: {
                // app: JSON.stringify(this.app),
                // children: JSON.stringify(this.app.children),
                color: this.color,
                layerId: this.layer.id,
                layerName: this.layer.name
                // layer: JSON.stringify(this.layer)
            }
          };
          this.router.navigate([`/mideme-options`], navigateParamsL);
        //   this.router.navigate([`/mideme-options`, this.layer], navigateParamsL);
          break;

      case 'FILTRO':
          break;

      case 'MAPA DE VIAJES':
          console.log('Viajes');
          OtherLayerComponent.layerTypeCurrentlyActive = 'MAPA DE VIAJES';
          const navigateParams: NavigationExtras = {
            queryParams: {
                // app: JSON.stringify(this.app),
                // children: JSON.stringify(this.app.children),
                nomApp: this.app.children.find((layer: OtherLayer) => layer.layerType === 'MAPA DE VIAJES').name,
                color: this.app.color,
                appId: this.app.id
            }
          };
          this.router.navigate([`/consulta-viajes`], navigateParams);
          break;

      case 'MAPA DE RUTAS CERCANAS':
          if (
              OtherLayerComponent.layerTypeCurrentlyActive ===
              'MAPA DE RUTAS CERCANAS'
          ){
              return; }
          if (OtherLayerComponent.layerTypeCurrentlyActive) {
              return;
          }
          OtherLayerComponent.layerTypeCurrentlyActive =
              'MAPA DE RUTAS CERCANAS';
          // this.navCtrl.push(
          //     MenuRutasPage,
          //     { 'page-name': 2, color: this.color, app: this.app },
          //     { animate: false }
          // );
          const navigateParamsRC: NavigationExtras = {
            queryParams: {
                nomApp: this.app.children.find((layer: OtherLayer) => layer.layerType === 'MAPA DE RUTAS CERCANAS').name,
                color: this.app.color,
                appId: this.app.id
            }
          };
          this.router.navigate([`/menu-rutas`], navigateParamsRC);
          break;

      case 'MAPA DE LÍNEAS Y RUTAS':
          if (
              OtherLayerComponent.layerTypeCurrentlyActive ===
              'MAPA DE LÍNEAS Y RUTAS'
          ){
              return; }

          if (OtherLayerComponent.layerTypeCurrentlyActive) {
              // this.navCtrl.popToRoot({ animate: false }).then(() => {
              //     OtherLayerComponent.layerTypeCurrentlyActive =
              //         "MAPA DE LÍNEAS Y RUTAS";
              //     this.navCtrl.push(
              //         LineasYRutasMapaPage,
              //         {
              //             "page-name": 3,
              //             color: this.color,
              //             app: this.app
              //         },
              //         { animate: false }
              //     );
              // });
              return;
          }

          OtherLayerComponent.layerTypeCurrentlyActive =
              'MAPA DE LÍNEAS Y RUTAS';
          // this.navCtrl.push(
          //     LineasYRutasMapaPage,
          //     { "page-name": 3, color: this.color, app: this.app },
          //     { animate: false }
          // );
          const navigateParamsLR: NavigationExtras = {
            queryParams: {
                nomApp: this.app.children.find((layer: OtherLayer) => layer.layerType === 'MAPA DE LÍNEAS Y RUTAS').name,
                color: this.app.color,
                appId: this.app.id
            }
          };
          this.router.navigate([`/lineas-y-rutas-mapa`], navigateParamsLR);
          break;

      case 'MAPA ENCICLA':
          if (
              OtherLayerComponent.layerTypeCurrentlyActive ===
              'MAPA ENCICLA'
          ){
              return; }

          if (OtherLayerComponent.layerTypeCurrentlyActive) {
              // this.navCtrl.popToRoot({ animate: false }).then(() => {
              //     OtherLayerComponent.layerTypeCurrentlyActive =
              //         'MAPA ENCICLA';
              //     this.navCtrl.push(
              //         EnciclaPage,
              //         {
              //             'page-name': 4,
              //             color: this.color,
              //             app: this.app
              //         },
              //         { animate: false }
              //     );
              // });
              return;
          }

          OtherLayerComponent.layerTypeCurrentlyActive =
              'MAPA ENCICLA';
          // this.navCtrl.push(
          //     EnciclaPage,
          //     { 'page-name': 4, color: this.color, app: this.app },
          //     { animate: false }
          // );
          const navigateParamsE: NavigationExtras = {
            queryParams: {
                nomApp: this.app.children.find((layer: OtherLayer) => layer.layerType === 'MAPA ENCICLA').name,
                color: this.app.color,
                appId: this.app.id
            }
          };
          this.router.navigate([`/encicla`], navigateParamsE);
          break;
        }
    }

    async getModalDecisionTree(treeID, color, layerId) {
        const modal = await this.modalCtrl.create({
            component: DecisionTreeComponent,
            componentProps: {
                treeID,
                color,
                layerId
            }
        });
        await modal.present();
    }
    async getModalCuidameCreate(layer, color, layerId) {
        const modal = await this.modalCtrl.create({
            component: CuidameDetailComponent,
            componentProps: {
                color,
                layerId,
                layer
            }
        });
        await modal.present();
    }
    layerActive(): string {
        if (
            this.layer.layerType === OtherLayerComponent.layerTypeCurrentlyActive
        ){ return this.color; }
        else {return 'transparent' ; }
    }
    isLayerActive(): string {
        return this.layer.selected ? 'layer-active' : 'layer-unactive';
    }

}
