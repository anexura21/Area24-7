import { AppLayer } from './../../entities/app-layer';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LavergService {

  private _appLayer: AppLayer;

  constructor() { }

  get appLayer(): AppLayer { return this._appLayer; }
  set appLayer( appLayer: AppLayer ) { this._appLayer = appLayer; }


}
