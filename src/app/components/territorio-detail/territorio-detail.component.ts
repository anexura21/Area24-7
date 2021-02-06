import { PosiblesViajesService } from './../../providers/posibles-viajes.service';
import { AppLayer } from './../../entities/app-layer';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Common } from './../../shared/utilidades/common.service';
import { LayerService } from './../../providers/layer.service';
import { MessageService } from './../../providers/message.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FusionLayerComponent } from '../fusion-layer/fusion-layer.component';

@Component({
  selector: 'territorio-detail',
  templateUrl: './territorio-detail.component.html',
  styleUrls: ['./territorio-detail.component.scss'],
})
export class TerritorioDetailComponent implements OnInit, OnDestroy {

  @Input()
  private info: any;

  @Input()
  private nombreCapa: string;

  @Input()
  private iconoCapa: string;

  private currentApp;

  constructor(private common: Common,
              private messageProvider: MessageService,
              private layerProvider: LayerService,
              private posiblesViajesProvider: PosiblesViajesService,
              private modalCtrl: ModalController,
              private router: Router) {
               }

  ngOnInit() {
    this.layerProvider.currentAppChange$.subscribe(app => {
      this.currentApp = app;
    });
  }

  ngOnDestroy() {
    FusionLayerComponent.flgIntegrationMovilidad = false;
  }

  goToMovilidad(): void {
    const movilidadApp: AppLayer = this.layerProvider.getAppsChangeValue().find((app: AppLayer): boolean => {
      return app.id === 1;
    });
    if (movilidadApp) {
      FusionLayerComponent.flgIntegrationMovilidad = true;
      this.posiblesViajesProvider
                .obtenerviajesSugeridos(false)
                .then( data => {
                  data['app'] = movilidadApp;
                  data['flag_show_sidemenu'] = false;
                  this.router.navigate([ '/vista-viajes', data ]);
                })
                .catch(error => {
                    console.log(TerritorioDetailComponent.name + ' goToMovilidad ' + JSON.stringify(error));
                    const msg = error;
                    this.common.presentAcceptAlert(msg.titulo, msg.descripcion);
                });

    }
    else {
      this.common.presentLoading();
      this.messageProvider.getByNombreIdentificador('territorio-detalle-app-movilidad-no-encontrada').subscribe(
          (response): void => {
              console.log(TerritorioDetailComponent.name + ' goToMovilidad error getByNombreIdentificador ' + JSON.stringify(response));
              const msg = response;
              this.common.presentAcceptAlert(msg.titulo, msg.descripcion);
              this.common.dismissLoading();
          },
          (error: any): any => {
              console.log(TerritorioDetailComponent.name + ' goToMovilidad error getByNombreIdentificador error' + JSON.stringify(error));
          }
      );
    }
  }

  closeModal(): void {
    this.modalCtrl.dismiss();
  }


}
