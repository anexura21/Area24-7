import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Common } from '../../shared/utilidades/common.service';
import { Layer } from '../../entities/layer';

@Component({
  selector: 'layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss'],
})
export class LayerComponent implements OnInit {

  @Input()
  protected layer: Layer;

  @Input()
  protected layerLevel: string;

  @Input()
  protected color: string;

  @Output()
  protected tapLayer = new EventEmitter<{}>();

  // protected active: boolean = false;
  protected common: Common;
  protected estado: boolean;

  constructor() {
    const injector = Common.getInjector();
    this.common = injector.get(Common);
  }

  ngOnInit() {}

  onTapLayer(): void {
    if (this.layer.children) {
        this.layer.children.forEach((childLayer: Layer) => {
            this.common.activeLayers.ids = this.common.activeLayers.ids.filter(
                id => id !== childLayer.id
            );
        });
    }
    this.layer.selected = !this.layer.selected;
    this.tapLayer.emit(this.layer);
    if (this.layer.selected) {this.common.stackActiveLayersSubcapas.push(this.layer.id); }
    else {
        this.common.stackActiveLayersSubcapas = this.common.stackActiveLayersSubcapas.filter(id => {
            return id !== this.layer.id;
        });
    }
  }

  public layerActive(): string {
      if (this.layer.selected) {
          return this.color;
      } else {
          return 'transparent';
      }
  }

  public isLayerActive(): string {
      return this.layer.selected ? 'layer-active' : 'layer-unactive';
  }


}
