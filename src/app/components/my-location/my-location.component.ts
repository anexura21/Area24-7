import { Component, EventEmitter, OnInit, Output, OnDestroy, Input } from '@angular/core';
import { MapService } from '../../providers/map.service';

@Component({
  selector: 'my-location',
  templateUrl: './my-location.component.html',
  styleUrls: ['./my-location.component.scss'],
})
export class MyLocationComponent implements OnInit, OnDestroy {

  @Input()
  private color: string;

  @Input()
  private actionRadius: number;

  @Output()
  private clickPedestrian = new EventEmitter<{ lat: number, lng: number }>();

  @Output()
  private dragendPedestrian = new EventEmitter<{ lat: number, lng: number }>();

  @Output()
  private clickMyLocationButton = new EventEmitter<void>();

  private locationMarker: google.maps.Marker;
  private actionRadiusCircle: google.maps.Circle;

  constructor() { }

  ngOnInit() {}

  ngOnDestroy(): void {
    console.log('My Location ngDestroy()');
    if (this.locationMarker) {
        console.log('Destroy location marker');
        this.locationMarker.setMap(null);
    }
    if (this.actionRadiusCircle) {this.actionRadiusCircle.setMap(null); }
    this.dragendPedestrian.emit({ lat: -1, lng: -1 });
  }

  onActionRadiusChange(actionRadius: number): void {
      if (this.actionRadiusCircle) {this.actionRadiusCircle.setRadius(actionRadius); }
  }

  onMyLocationClick(): void {
    this.clickMyLocationButton.emit();
  }

  createUpdatePositionMarker(lat: number, lng: number): void {
    const positionAct: google.maps.LatLng = new google.maps.LatLng(lat, lng);
    if (this.locationMarker) {
        this.locationMarker.setPosition(positionAct);
        this.actionRadiusCircle.setCenter(positionAct);

        if (!this.locationMarker.getMap()) {this.locationMarker.setMap(MapService.map); }
        if (!this.actionRadiusCircle.getMap()) {this.actionRadiusCircle.setMap(MapService.map); }
    }else {
        this.locationMarker = new google.maps.Marker({
            map: MapService.map,
            position: positionAct,
            icon: {
                scaledSize: new google.maps.Size(50, 50),
                url: 'assets/mapa/ubicacion.svg'
            },
            animation: google.maps.Animation.DROP,
            draggable: true,
            zIndex: google.maps.Marker.MAX_ZINDEX + 1
        });
        this.locationMarker.addListener('dragend', (args: any[]) => {
            console.log('dragend');
            const positionA: google.maps.LatLng = this.locationMarker.getPosition();
            this.dragendPedestrian.emit({ lat: positionA.lat(), lng: positionA.lng() });
        });
        this.locationMarker.addListener('click', (args: any[]): void => {
            const positionA: google.maps.LatLng = this.locationMarker.getPosition();
            this.clickPedestrian.emit({ lat: positionA.lat(), lng: positionA.lng() });
        });

        this.actionRadiusCircle = new google.maps.Circle({
            map: MapService.map,
            radius: this.actionRadius,
            fillColor: '#f9bbbb',
            strokeColor: '#f9bbbb',
            strokeOpacity: 0.3,
            strokeWeight: 0.8,
            fillOpacity: 0.1,
            clickable: false
        });
        this.actionRadiusCircle.bindTo('center', this.locationMarker, 'position');
    }
}

getPedestrianLocation(): { lat: number, lng: number } {
    return { lat: this.locationMarker.getPosition().lat(), lng: this.locationMarker.getPosition().lng() };
}

}
