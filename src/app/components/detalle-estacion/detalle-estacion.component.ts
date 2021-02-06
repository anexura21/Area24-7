import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { EstacionDisfrutameService } from '../../providers/estacion-disfrutame.service';

@Component({
  selector: 'detalle-estacion',
  templateUrl: './detalle-estacion.component.html',
  styleUrls: ['./detalle-estacion.component.scss'],
})
export class DetalleEstacionComponent implements OnInit {

  @Input()
  markerId: number;
  @Input()
  nombreCapa: string;
  @Input()
  idCapa: number;

  icono = '';
  color: string;
  toolbar: string;
  nombre: string;
  data;

  colorClass: string;

  recomendaciones: Array<any>;
  interpretacion: string;
  aireDescripcion: Array<any>;

  detalleItems;

  constructor(private modalCtrl: ModalController,
              private popoverCtrl: PopoverController,
              private estacionDisfrutameProvider: EstacionDisfrutameService) { }

  ngOnInit() {
    this.estacionDisfrutameProvider.getDetail(this.markerId).subscribe(response => {
      console.log('getMarkerInfo ' + JSON.stringify(response));

      this.data = response;

      this.detalleItems = [];
      this.recomendaciones = [];

      this.data.forEach((element, index) => {
          const key = Object.keys(element);
          // console.log(key, element[key[0]]);

          if (key[0] === 'icono') {
              this.icono = element[key[0]];
          } else if (key[0] === 'estado') {
              this.color = element[key[0]];
          } else if (key[0] === 'ListaRecomendaciones') {
              element[key[0]].forEach((childElement) => {
                  this.recomendaciones.push(childElement);
              });

          } else if (element[key[0]] !== '') {
              this.detalleItems.push(this.parser(JSON.stringify(element)));

              if (key[0] === 'nombre') {
                  this.nombre = this.parseName(element[key[0]]);
              } else if (key[0] === 'descripcionAire') {
                  this.parseAireDescripcion(element[key[0]]);

              } else if (key[0] === 'significado') {
                  this.interpretacion = element[key[0]];
              }
          }
      });

  });
}

parseAireDescripcion(descripcion: string): void {

  this.colorClass = (descripcion === 'No aplica normatividad') ? 'Black' : 'White';

  this.aireDescripcion = [];

  const nameStr = descripcion.split(' | ');

  nameStr.forEach((element) => {
      this.aireDescripcion.push(element);
  });
}

parseName(estacion: string): string {

  let nameStr;
  let nameToShow: string;

  nameStr = estacion.split(' - ');
  nameToShow = nameStr[nameStr.length - 1];

  return nameToShow;

}

parser(element: string) {
  let salida = element;

  salida = salida.replace('{', '');
  salida = salida.replace('}', '');
  salida = salida.replace(':', ': ');
  while (salida.indexOf('"') > -1) {
      salida = salida.replace('"', '');
  }
  return salida;
}

closeModal(): void {
  this.modalCtrl.dismiss();
}

}
