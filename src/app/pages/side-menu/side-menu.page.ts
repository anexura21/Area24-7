import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TransportMode } from '../../entities/transport-mode';
import { AppLayer } from './../../entities/app-layer';
import { LayerService } from '../../providers/layer.service';

@Component({
  selector: 'page-side-menu',
  templateUrl: './side-menu.page.html',
  styleUrls: ['./side-menu.page.scss'],
})
export class SideMenuPage implements OnInit {

  private transportModes: TransportMode[];
  private currentApp: AppLayer;

    constructor(private modalCtrl: ModalController,
                private layerSvc: LayerService) { }

  ngOnInit() {
      this.layerSvc.currentAppChange$.subscribe(
        (appLayer: AppLayer) => {
            this.currentApp = appLayer;
            console.log(this.currentApp.id);
        }
      );
      this.layerSvc.transportModesChange$.subscribe(
        (transportModes: TransportMode[]): void => {
            console.log(SideMenuPage.name + ' ngOnInit transportModesChange$ ' + JSON.stringify(transportModes));
            this.transportModes = transportModes;
        }
      );
  }

  changeRadius(radius){
    this.currentApp.radius=radius;
  }

  emitActionRadiusChange(): void {

      // console.log("side-menu", "cambió el radio", this.currentApp.radius);
  //    this.layerProvider.updateAppInTree(this.currentApp);
    this.layerSvc.emitCurrentAppChange(this.currentApp);
  }

  emitTransportModeChange(): void {
      this.layerSvc.emitTransportModesChange(this.transportModes);
  }

  actionRadiusStepDown(): void {
      if (this.currentApp.minRadius < this.currentApp.radius) {
          this.currentApp.radius -= 1;
          this.emitActionRadiusChange();
      }
  }

  actionRadiusStepUp() {
      if (this.currentApp.radius < this.currentApp.maxRadius) {
          this.currentApp.radius += 1;
          this.emitActionRadiusChange();
      }
  }

  onCloseMenu() {
    if (this.currentApp && this.currentApp.id !== -1) {
      this.layerSvc.emitCurrentAppChange(this.currentApp);
      this.layerSvc.emitTransportModesChange(this.transportModes);
      this.layerSvc.putPreferences().subscribe(
        response => {
          console.log(SideMenuPage.name + ' onCloseMenu putPreferences ' + JSON.stringify(response));
        },
        error => {
          console.log(SideMenuPage.name + ' onCloseMenu putPreferences error ' + JSON.stringify(error));
        }
      );
    }
  }

}
