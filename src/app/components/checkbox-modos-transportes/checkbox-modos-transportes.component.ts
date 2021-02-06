import { LayerService } from './../../providers/layer.service';
import { PosiblesViajesService } from './../../providers/posibles-viajes.service';
import { Common } from './../../shared/utilidades/common.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ItemCheckBoxModoTransporte } from '../../entities/movilidad/item-checkbox-modo-transporte';
import { Ubicacion } from '../../entities/movilidad/ubicacion.model';
import { TranslateService } from '@ngx-translate/core';
import { TransportMode } from '../../entities/transport-mode';

@Component({
  selector: 'checkbox-modos-transportes',
  templateUrl: './checkbox-modos-transportes.component.html',
})
export class CheckboxModosTransportesComponent implements OnInit {

  lsItemCheckBoxModoTransporte: ItemCheckBoxModoTransporte[];
  modoTransporteSelected: string;
  @Input() ubicacionOrigen: Ubicacion;
  @Input() ubicacionDestino: Ubicacion;
  @Output() responseViajesSugeridos = new EventEmitter();

  private preferenciasTransportes: any[];
  public sidebarEvent: any;

  constructor(private utilidades: Common,
              private posiblesViajesProvider: PosiblesViajesService,
              private layerProvider: LayerService,
              private translateService: TranslateService) {
    this.modoTransporteSelected = '';
    this.layerProvider.transportModesChange$.subscribe(
      (transportsPreferences: TransportMode[]) => {
        this.preferenciasTransportes = transportsPreferences;
      }
    );
  }

  ngOnInit() {
    this.lsItemCheckBoxModoTransporte = [];
    this.cargarModosTransportes();
  }

  cargarModosTransportes() {
    const modosTranportes = this.preferenciasTransportes;

    modosTranportes.forEach(modoTranporte => {
      const item = new ItemCheckBoxModoTransporte();

      item.idModoTransporte = modoTranporte.id;
      item.nombre = modoTranporte.nombre;
      item.activo = modoTranporte.activo;

      item.iconOn = modoTranporte.urlIconEnabled;
      item.iconOff = modoTranporte.urlIconDisabled;

      if (item.activo) {
        item.icon = item.iconOn;
      } else {
        item.icon = item.iconOff;
      }
      this.lsItemCheckBoxModoTransporte.push(item);
    });
  }

  onClickItem(item) {
    this.modoTransporteSelected = item.nombre;
    this.invertirActivos(
      this.lsItemCheckBoxModoTransporte,
      item.idModoTransporte
    );

    this.posiblesViajesProvider.cambiarPosiciones(
      this.ubicacionOrigen,
      this.ubicacionDestino
    );
    this.posiblesViajesProvider
      .obtenerviajesSugeridos(true, '9,' + item.idModoTransporte)
      .then(data => {
        this.responseViajesSugeridos.emit(data);
      })
      .catch(error => {
        const title = this.translateService.instant('app.title');
        this.utilidades.basicAlert(title, error);
      });
  }

  invertirActivos(lsItems: any[], idModoTransporte) {
    for (const item of lsItems) {
      if(item.idModoTransporte === idModoTransporte){
        item.activo = true;
        item.icon = item.iconOn;
      } else {
        item.activo = false;
        item.icon = item.iconOff;
      }
    }
  }

}
