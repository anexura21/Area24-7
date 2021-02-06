import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Common } from '../../shared/utilidades/common.service';
import { AppLayer } from '../../entities/app-layer';
import { LayerService } from '../../providers/layer.service';
import { MapService } from '../../providers/map.service';
import { GeoLayer } from '../../entities/geo-layer';
import { Layer } from 'src/app/entities/layer';
import { OtherLayer } from 'src/app/entities/other-layer';

@Component({
  selector: 'layer-manager',
  templateUrl: './layer-manager.component.html',
  styleUrls: ['./layer-manager.component.scss'],
})
export class LayerManagerComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  private app: AppLayer;

  private currentLayerId: number;
  private resetFusionLayerSubscription: Subscription;

  constructor(private layerProvider: LayerService,
              private common: Common,
              private mapProvider: MapService) { }

  ngOnInit() {
    this.resetFusionLayerSubscription = LayerService.resetFusionLayer$.subscribe(() => {
      console.log('resetFusionLayerSubscription');
      this.currentLayerId = undefined;
  });
  // this.app.children.sort((a, b) => a.order > b.order ? 1 : -1);
}

ionViewDidEnter() {
  console.log('ionViewDidEnter');
}

ngAfterViewInit() {
  console.log('ngAfterViewInit');
}

ngOnDestroy(): void {
  console.log('ngOnDestroy');
  if (this.resetFusionLayerSubscription) {this.resetFusionLayerSubscription.unsubscribe(); }
  // This is done by InicioPage -> onClickHome() deleting each layer
  this.app = this.mapProvider.cleanApp(this.app);
}

loadCategories(id: number): void {
  const layer: Layer = this.app.children.find(layerF => layerF.id === id);
  if (layer.children === undefined) {
      this.layerProvider.getNLayer('CATEGORIA', id).subscribe(
          response => {
              // this.app.children.sort((a, b) => a.order > b.order ? 1 : -1);
              console.log(LayerManagerComponent.name + ' loadCategories getNLayer ' + JSON.stringify(response));
              layer.children = AppLayer.parseStrategy(Object.values(response));
              layer.children.sort((a, b) => a.id > b.id ? 1 : -1);
              console.log('las categorias', JSON.stringify(response));
          },
          (error) => console.log(LayerManagerComponent.name + ' loadCategories getNLayer error' + JSON.stringify(error))
      );
  }
}

// TODO: add the logic of setting currentLayer (layerStack) in this function
onTapLayer(layer: Layer): void {
  // layer.selected = !layer.selected
  console.log('el layer seleccionado', layer);
  // this part of the conditional is never used again
  if (layer.selected) {
      if (layer.children && layer.children.length > 0) {
          this.currentLayerId = layer.id;
      }
      else {
          console.log('CARGAR CATEGORIAS');
          this.loadCategories(layer.id);
          this.currentLayerId = layer.id;
          this.app.children.forEach(child => {
              if (child.id === this.currentLayerId) {child.active = true; }
          });
      }
  }
  else {
      this.mapProvider.cleanLayer(layer);
  }
}


getCurrentLayer(): Layer {
  console.log('getCurrentLayer() LayerManagerComponent');
  if (this.currentLayerId === undefined) {
      if (this.common.stackActiveLayersSubcapas && this.common.stackActiveLayersSubcapas.length > 0) {
          this.currentLayerId = this.common.stackActiveLayersSubcapas.pop();
          this.common.stackActiveLayersSubcapas.push(this.currentLayerId);
      }
  }

  const layer: Layer = this.app.children.find((layerF: Layer): boolean => {
      return layerF.selected && layerF.id === this.currentLayerId;
    });
  if (!layer) {this.currentLayerId = undefined; }
  if (layer) {return layer; }
  }

  isInstanceOf(layer: Layer): string {
    if (layer instanceof GeoLayer) {return 'GeoLayer'; }
    else if (layer instanceof OtherLayer) {return 'OtherLayer'; }
    else {return 'Layer'; }
  }

  isLayerTypeOf(layer: Layer, layerType: string): boolean {
    return layer instanceof GeoLayer
        && layer.layerType === layerType;
  }

  getFixedActionRadius(appId: number, layerId: number): number {
    switch (appId) {
        case 2: // Cuidame
            if (layerId === 211) {return Number.MAX_VALUE; } // Mis reportes
            else if (layerId === 185) {return Number.MAX_VALUE; } // Buscador
            else {return 500; }

        case 3: // Asómbrate
            if (layerId === 211) {return Number.MAX_VALUE; }// Mis avistamientos
            else {return 500; }

        // case 5: //Mi Entorno
        //   return Number.MAX_VALUE;
        default:
            return undefined;
    }
  }



}
