import { ModalController } from '@ionic/angular';
import { LayerService } from './../../providers/layer.service';
import { Component, Input, OnInit } from '@angular/core';
import { Common } from '../../shared/utilidades/common.service';

@Component({
  selector: 'ficha-caracterizacion',
  templateUrl: './ficha-caracterizacion.component.html',
  styleUrls: ['./ficha-caracterizacion.component.scss'],
})
export class FichaCaracterizacionComponent implements OnInit {

  @Input()
  private characterizationCard;

  private currentApp;
  private isFullCharacterizationCard: boolean;

  datos = {
    municipio: 'Medellin',
    capas: [
      {
        nombre: 'Capa 1',
        icono: 'http://172.16.0.20:9095/api/icono/167',
        categorias: [
          {
            nombre: 'Categoria 1',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          },
          {
            nombre: 'Categoria 2',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          },
          {
            nombre: 'Categoria 3',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          }
        ]
      },
      {
        nombre: 'Capa 2',
        icono: 'http://172.16.0.20:9095/api/icono/167',
        categorias: [
          {
            nombre: 'Categoria 1',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          },
          {
            nombre: 'Categoria 2',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          }
        ]
      },
      {
        nombre: 'Capa 2',
        icono: 'http://172.16.0.20:9095/api/icono/167',
        categorias: [
          {
            nombre: 'Categoria 1',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          },
          {
            nombre: 'Categoria 2',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          }
        ]
      },
      {
        nombre: 'Capa 2',
        icono: 'http://172.16.0.20:9095/api/icono/167',
        categorias: [
          {
            nombre: 'Categoria 1',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          },
          {
            nombre: 'Categoria 2',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          }
        ]
      },
      {
        nombre: 'Capa 2',
        icono: 'http://172.16.0.20:9095/api/icono/167',
        categorias: [
          {
            nombre: 'Categoria 1',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          },
          {
            nombre: 'Categoria 2',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          }
        ]
      },
      {
        nombre: 'Capa 2',
        icono: 'http://172.16.0.20:9095/api/icono/167',
        categorias: [
          {
            nombre: 'Categoria 1',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          },
          {
            nombre: 'Categoria 2',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          }
        ]
      },
      {
        nombre: 'Capa 2',
        icono: 'http://172.16.0.20:9095/api/icono/167',
        categorias: [
          {
            nombre: 'Categoria 1',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          },
          {
            nombre: 'Categoria 2',
            icono: 'http://172.16.0.20:9095/api/icono/167',
            nombreMarcador: 'Nombre del marcador'
          }
        ]
      }
    ]
  };

  constructor(private layerProvider: LayerService,
              private common: Common,
              private modalCtrl: ModalController) { }

  ngOnInit() {
    console.log(this.characterizationCard);
    this.layerProvider.currentAppChange$.subscribe(app => {
      this.currentApp = app;
    });
  }

  closeModal(): void {
    this.modalCtrl.dismiss();
  }



}
