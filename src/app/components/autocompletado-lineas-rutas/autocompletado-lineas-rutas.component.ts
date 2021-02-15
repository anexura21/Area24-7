import { RutasLineasResponse } from './../../entities/rutas-lineas-response';
import { Common } from './../../shared/utilidades/common.service';
import { WsMovilidadService } from './../../providers/movilidad/ws-movilidad.service';
import { AppLayer } from './../../entities/app-layer';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-autocompletado-lineas-rutas',
  templateUrl: './autocompletado-lineas-rutas.component.html',
  // styleUrls: ['./autocompletado-lineas-rutas.component.scss'],
})
export class AutocompletadoLineasRutasComponent {

  autocompleteItems: any[];
  @Input() criterioBusqueda: string;
  @Input() appLayer: AppLayer;
  @Output() responseAutocompletado = new EventEmitter();

  constructor(public wsMovilidad: WsMovilidadService, private utilidades: Common) { }

  ionViewWillLeave(){
    this.criterioBusqueda = '';
   }

   actualizarListado() {
     if (this.criterioBusqueda === '') {
       this.autocompleteItems = [];
       return;
     }

     this.onObtenerRutasyLineasAutocompletado(this.criterioBusqueda);
   }


   onKeyEnterRutaLinea(event: any) {
     if (event.keyCode === 13) {
       this.seleccionarItem(this.criterioBusqueda, 2);
     }
   }

   seleccionarItem(item: any, tipo: number) {
     this.utilidades.presentLoading();
     console.log('Click Item seleccionado', item);
     if (tipo === 1) {
       this.criterioBusqueda = item.descripcion;
       this.onObtenerRutaLineaDetalle(item.tipo, item.id);
     } else {
       this.onObtenerRutasLineas(this.criterioBusqueda);
     }
   }


   clickObtenerRutasLineas() {
     if (this.criterioBusqueda.trim().length > 0) {
       this.utilidades.presentLoading();
       this.onObtenerRutasLineas(this.criterioBusqueda);
     } else {
       this.utilidades.basicAlert(
         'Movilidad',
         'Por favor diligencie el campo de busqueda!'
       );
     }

   }

   onObtenerRutasyLineasAutocompletado(criterio: any) {
     this.wsMovilidad
     .obtenerRutasyLineasAutocompletado(criterio)
     .subscribe(
       (succces: any) => {
        //  debugger
         this.autocompleteItems = [];
         this.autocompleteItems = succces;
       },
       error => {
         this.autocompleteItems = [];
       }
     );
   }

   onObtenerRutaLineaDetalle(tipo: any, id: any) {
     this.wsMovilidad
       .obtenerRutaLineaDetalle(tipo, id)
       .subscribe(
         (succces: any) => {

           console.log('Seleccionar item', succces);

           this.autocompleteItems = [];
           this.utilidades.dismissLoading();

           const data = new RutasLineasResponse();

           if (succces.linea != null) {
             const lineas = [];
             lineas.push(succces.linea);
             data.lineas = lineas;
             data.rutas = [];
           } else {
             const rutas = [];
             rutas.push(succces.ruta);
             data.rutas = rutas;
             data.lineas = [];
           }

           const response = {
             data,
             tipoResponse: 1
           };
           this.responseAutocompletado.emit({ response, criterioBusqueda: this.criterioBusqueda });

         },
         error => {
           this.utilidades.dismissLoading();
           this.utilidades.basicAlert(
             'Movilidad',
             'Ocurrió un inconveniente inténtelo nuevamente'
           );

         }
       );
   }


   onObtenerRutasLineas(data: any) {
     this.wsMovilidad.obtenerRutasyLineas(data)
     .subscribe(
       (succces: any) => {
         this.autocompleteItems = [];
         if (succces.codigo === 1) {
           const response = {
             data: succces,
             tipoResponse: 2
           };
           this.responseAutocompletado.emit({ response, criterioBusqueda: this.criterioBusqueda });

         } else {
           if (succces.codigo === 2) {
             this.utilidades.basicAlert(
               'Movilidad',
               'No se encontraron resultados'
             );
           }
         }
         this.utilidades.dismissLoading();
       },
       error => {
         this.utilidades.dismissLoading();
         this.utilidades.basicAlert(
           'Movilidad',
           'Ocurrió un inconveniente inténtelo nuevamente'
         );
       }
     );
   }

   onFocusSearchBar() {
     // document.getElementById('gridLineasRutas').classList.add("no-scroll");
     document.body.classList.add('no-scroll');
   }

   onBlurSearchBar() {
     // document.getElementById('gridLineasRutas').classList.remove("no-scroll");
     document.body.classList.remove('no-scroll');
   }


   clearSearch(event: any){
     this.criterioBusqueda = ' ';
   }

}
