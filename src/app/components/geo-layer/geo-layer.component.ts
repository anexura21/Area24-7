import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GeoLayer } from '../../entities/geo-layer';
import { LayerComponent } from '../layer/layer.component';

@Component({
  selector: 'geo-layer',
  templateUrl: './geo-layer.component.html',
  styleUrls: ['./geo-layer.component.scss'],
})
export class GeoLayerComponent extends LayerComponent implements OnInit, OnDestroy {

  protected static currentLat: number;
  protected static currentLng: number;

  private static actionRadiusChange = new BehaviorSubject<number>(0);
  private static locationChange = new BehaviorSubject<{ lat: number, lng: number }>({ lat: 0, lng: 0 });

  protected static actionRadiusChanged$ = GeoLayerComponent.actionRadiusChange.asObservable();
  protected static locationChanged$ = GeoLayerComponent.locationChange.asObservable();

  protected actionRadius: number;
  protected isLoading = false;
  @Input()
  protected layer: GeoLayer;

  @Input()
  protected fixedActionRadius?: number;


  static emitActionRadiusChange(actionRadius: number): void {
      GeoLayerComponent.actionRadiusChange.next(actionRadius);
  }

  static emitLocationChange(latLng: { lat: number, lng: number }): void {
      GeoLayerComponent.locationChange.next(latLng);
  }



  constructor() {
    super();
    if (this.fixedActionRadius) {this.actionRadius = this.fixedActionRadius; }
  }

  ngOnInit() {
    console.log('entro en geolayer');
  }

  ngOnDestroy(): void {}

}
