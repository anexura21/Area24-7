import { ModoTrasporteStringsViajes } from './../../entities/movilidad/constantes';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsMovilidadService {

  public static convertTime24to12(time24: string): string {
    const  tmpArr = time24.split(':');
    let time12;
    if (+tmpArr[0] === 12) {
      time12 = tmpArr[0] + ':' + tmpArr[1] + ' pm';
    } else {
      if (tmpArr[0] === '00') {
        time12 = '12:' + tmpArr[1] + ' am';
      } else {
        if (+tmpArr[0] > 12) {
          time12 = (+tmpArr[0] - 12) + ':' + tmpArr[1] + ' pm';
        } else {
          time12 = (+tmpArr[0]) + ':' + tmpArr[1] + ' am';
        }
      }
    }
    return time12;
  }

  public static obtenerUsuarioActivo(): any {
    return JSON.parse(localStorage.getItem('usuario'));
  }

  /**
   * metodo encargado de convertir el modo de transporte al id de transporte
   */
  public static obtenerModoTransporteHuella(modo): number {
    let res = 9;
    switch (modo) {
      case ModoTrasporteStringsViajes.METRO:
        res = 2;
        break;

      case ModoTrasporteStringsViajes.TRANVIA:
        res = 0;
        break;

      case ModoTrasporteStringsViajes.CAMINAR:
        res = 9;
        break;

      case ModoTrasporteStringsViajes.BICICLETA_PARTICULAR:
        res = 8;
        break;

      case ModoTrasporteStringsViajes.METRO_PLUS:
        res = 3;
        break;

      case ModoTrasporteStringsViajes.METRO_CABLE:
        res = 6;
        break;
      case ModoTrasporteStringsViajes.ALIMENTADOR:
        res = 4;
        break;
      case ModoTrasporteStringsViajes.AUTOBUS:
        res = 1;
        break;
      case ModoTrasporteStringsViajes.ENCICLA:
        res = 8;
        break;
    }
    return res;
  }
}
