import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TransportMode } from '../../entities/transport-mode';
import { AppLayer } from './../../entities/app-layer';
import { LayerService } from '../../providers/layer.service';

@Component({
  selector: 'side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {

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
            console.log(SideMenuComponent.name + ' ngOnInit transportModesChange$ ' + JSON.stringify(transportModes));
            this.transportModes = transportModes;
        }
      );
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
          console.log(SideMenuComponent.name + ' onCloseMenu putPreferences ' + JSON.stringify(response));
        },
        error => {
          console.log(SideMenuComponent.name + ' onCloseMenu putPreferences error ' + JSON.stringify(error));
        }
      );
    }
  }

}
