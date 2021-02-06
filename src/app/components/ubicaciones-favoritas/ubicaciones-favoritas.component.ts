import { Ubicacion } from './../../entities/movilidad/ubicacion.model';
import { AppLayer } from './../../entities/app-layer';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ubicaciones-favoritas',
  templateUrl: './ubicaciones-favoritas.component.html',
})
export class UbicacionesFavoritasComponent implements OnInit {

  @Input()
  app: AppLayer;

  @Output()
  establecerUbicacion: EventEmitter<Ubicacion> = new EventEmitter();

  constructor() { }

  ngOnInit() {}

}
