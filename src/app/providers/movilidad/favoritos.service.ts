import { Ubicacion } from './../../entities/movilidad/ubicacion.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {

  private _favoritos: any;

  constructor() {
    const ubicacionPrueba = new Ubicacion();
    ubicacionPrueba.txtPlaceholder = 'placeholder de prueba';
    ubicacionPrueba.descripcion = 'Medellín - Antioquia, Colombia';
    ubicacionPrueba.prediccion = JSON.parse('{"description":"Medellín - Antioquia, Colombia","id":"2beb80836c14b495e8959d2c0ecf2c482ab51600","matched_substrings":[{"length":3,"offset":0}],"place_id":"ChIJBa0PuN8oRI4RVju1x_x8E0I","reference":"CkQ3AAAA3HN8ZTC-d_zSSwxqmXIjTf6WK0-EQTR0cNlEBV601gUDFQpyUJHSHJE6y8LBriUr6s9JRIC2wQXfiymGAZ39dRIQHhIhxHNej3yqLQEk1KMvEhoUN8sMtVoduY2xGLj2HIz8Gxx0A60","structured_formatting":{"main_text":"Medellín","main_text_matched_substrings":[{"length":3,"offset":0}],"secondary_text":"Antioquia, Colombia"},"terms":[{"offset":0,"value":"Medellín"},{"offset":11,"value":"Antioquia"},{"offset":22,"value":"Colombia"}],"types":["locality","political","geocode"]}');

    this._favoritos = [{
        nombre: 'calle falsa 123',
        ubicacion: ubicacionPrueba
    }];
   }

   get(): any {
    return this._favoritos;
  }

  crear(ubicacion) {
      this._favoritos.push(ubicacion);
      console.log('FavoritosProvider:crear', this._favoritos);
  }

  eliminar(ubicacion) {
      console.log('FavoritosProvider:eliminarAntes', this._favoritos);
      this._favoritos.splice(this._favoritos.indexOf(ubicacion), 1);
      console.log('FavoritosProvider:eliminarDespues', this._favoritos);
  }
}
