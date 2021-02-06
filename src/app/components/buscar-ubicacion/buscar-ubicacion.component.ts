import { GmapsMovilidadService } from './../../providers/movilidad/gmaps-movilidad.service';
import { MessageService } from './../../providers/message.service';
import { ToastController } from '@ionic/angular';
import { Common } from './../../shared/utilidades/common.service';
import { GooglemapsService } from './../../providers/googlemaps.service';
import { FavoritosService } from './../../providers/movilidad/favoritos.service';
import { MODOS_BUSQUEDA, Ubicacion } from './../../entities/movilidad/ubicacion.model';
import { Component, Input, OnInit, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'buscar-ubicacion',
  templateUrl: './buscar-ubicacion.component.html',
})
export class BuscarUbicacionComponent implements OnInit, AfterViewInit {

  @Input() animate?: any;
  @Input() ubicacion: Ubicacion;
  @Input() botonAtras?: boolean;
  @Input() root?: any;
  @Input() dismissComponent?: boolean;
  @Input() editable?: boolean;

  @Output() clickSeleccionarUbicacionMapa?: EventEmitter<boolean> = new EventEmitter();
  @Output() clickSeleccionarPrediccion?: EventEmitter<boolean> = new EventEmitter();
  @Output() clickAceptarUbicacionMapa?: EventEmitter<boolean> = new EventEmitter();
  @Input() showSeleccionarEnMapa?: boolean;

  autocomplete: any;
  geocoder: any;
  autocompleteItems: any;
  acService: any;

  placesService: any;
  location: any;
  radius: any;
  marker: any;
  ubicacionesFavoritas: any;
  ubicacionFavoritaPage: any;

  public modos = MODOS_BUSQUEDA;
  public LOGO = '.assets/movilidad/iconos/bus.png';

  constructor(public favoritosProvider: FavoritosService,
              public googleMaps: GooglemapsService,
              private utilidades: Common,
              private elRef: ElementRef,
              public toastCtrl: ToastController,
              private translateService: TranslateService,
              private messageProvider: MessageService) {
                this.showSeleccionarEnMapa = true;
                this.autocompleteItems = [];
                this.acService = new google.maps.places.AutocompleteService();
                this.geocoder = new google.maps.Geocoder();
                this.editable = true;
              }

  ngOnInit() {}

  ngAfterViewInit() {
    if (
      this.elRef.nativeElement.querySelector(
        '#sbDireccion .searchbar-search-icon '
      ) != null
    ) {
      this.elRef.nativeElement
        .querySelector('#sbDireccion .searchbar-search-icon')
        .addEventListener('click', () => {
          this.utilidades.presentLoading();
        });
    }
  }

  updateSearch() {
    try {
        if (this.ubicacion.descripcion === '') {
          this.autocompleteItems = [];
          return;
        }
        const self = this;

        const defaultBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(6.075967, -75.633433),
          new google.maps.LatLng(6.450092, -75.323971)
        );

        const config = {
          input: self.ubicacion.descripcion,
          bounds: defaultBounds,
          componentRestrictions: { country: 'CO' }
        };

        this.acService.getPlacePredictions(config, (predictions, status) => {
          self.autocompleteItems = [];
          if (predictions != null) {
              predictions.forEach((prediction) => {
              self.autocompleteItems.push(prediction);
            });
          }
      });
    } catch (error) {
      console.log(error);
    }
  }

  seleccionarPrediccion(item: any) {
    this.utilidades.presentLoading();
    GmapsMovilidadService.codificarDireccion(item.description, 'address')
      .then(data => {

        this.utilidades.dismissLoading();
        this.ubicacion.latitud = data.latitud;
        this.ubicacion.longitud = data.longitud;
        this.ubicacion.descripcion = item.description;
        this.autocompleteItems = [];
        if (this.clickSeleccionarPrediccion) {
          this.clickSeleccionarPrediccion.emit();
        }
      })
      .catch(error => {
          this.messageProvider.getByNombreIdentificador('inconveniente_movilidad').subscribe(
            (response: any): void => {
                const msg = response;
                this.utilidades.basicAlert(msg.titulo, msg.descripcion);
                this.utilidades.dismissLoading();
            }
        );
      });
  }


  buscarDireccion(event: any) {
    //
    if (event.keyCode === 13 || event.keyCode === undefined) {
      const item = { description: this.ubicacion.descripcion };
      this.seleccionarPrediccion(item);
    }
  }


  search(event: any){
    const item = { description: this.ubicacion.descripcion };
    this.seleccionarPrediccion(item);
  }


  seleccionarUbicacionMapa() {
    this.clickSeleccionarUbicacionMapa.emit(true);
  }

  setEmpty(event: any){
    this.ubicacion.descripcion = '';
  }

}
