import { ModalController } from '@ionic/angular';
import { EstacionDisfrutameService } from './../../providers/estacion-disfrutame.service';
import { Component, OnInit, Input } from '@angular/core';

interface Data {
  municipio: string;
  nombreEstacion: string;
  tiempoDetails: any;
}
@Component({
  selector: 'app-clima-detalle',
  templateUrl: './clima-detalle.component.html',
  styleUrls: ['./clima-detalle.component.scss'],
})
export class ClimaDetalleComponent implements OnInit {

  private forecastOrder: string[] = ['Madrugada', 'Mañana', 'Tarde', 'Noche'];

  data: Data;

  @Input()
  polygonId: number;

  @Input()
  color: string;

  private currentDay: string;
  private tomorrowDay: string;

  private urlIcon: string;
  private precipitacion: string;

  private currentForecast: any[] = [];
  private tomorrowForecast: any[] = [];

  private nombreEstacion = '';

  private months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];


  constructor(private modalCtrl: ModalController,
              private estacionDisfrutameProvider: EstacionDisfrutameService) { }

  ngOnInit() {
    this.estacionDisfrutameProvider.getClima(this.polygonId).subscribe(
      (data: Data) => {
        this.data = data;
        console.log('DATA DE ICONOS', data);
        if (data.municipio === 'MEDELLIN') {
            data.municipio = 'Medellín';
            this.nombreEstacion = this.parseStationName(data.nombreEstacion);
        }

        this.setIconAndPrecipitation(this.data.tiempoDetails);
        this.splitForecast();
        });

        // this.getMonthAndDay();
    this.setDates();
  }

  splitForecast(): void {
    this.data.tiempoDetails.forEach((element, index) => {
      if (index <= 3) {
          this.currentForecast.push(element);
      }
      else {
          this.tomorrowForecast.push(element);
      }
    });

    this.currentForecast = this.sortForecast(this.currentForecast);
    this.tomorrowForecast = this.sortForecast(this.tomorrowForecast);

  }

  sortForecast(listForecast: any[]): any[] {
    const newForecastList: any[] = new Array();
    this.forecastOrder.forEach((focastOrderItem: string) => {
        const itemIndex: any = listForecast.findIndex((forecastItem: any): boolean => {
            return forecastItem.tiempo === focastOrderItem;
        });
        if (itemIndex) {
            newForecastList.push(listForecast[itemIndex]);
            listForecast.splice(itemIndex, 1);
        }
    });
    return newForecastList.concat(listForecast);
  }

  parseStationName(estacion: string): string {
      let nombre = estacion;
      nombre = nombre.replace('Medellin ', ', ');
      if (estacion === 'Santa Elena') {
          nombre = nombre.replace('Santa Elena', ', Santa Elena');
      }
      return nombre;
  }

  setDates(): void {
      const date = new Date();
      // this.currentDay = this.months[date.getMonth()] + ' ' + date.getDate();
      this.currentDay = `${this.months[date.getMonth()]} ${date.getDate()}`;
      date.setDate(date.getDate() + 1);
      // this.tomorrowDay = this.months[date.getMonth()] + ' ' + date.getDate();
      this.tomorrowDay = `${this.months[date.getMonth()]} ${date.getDate()}`;
  }

  setIconAndPrecipitation(tiempoDetails): void {
      tiempoDetails.forEach((element, index) => {
          if (index <= 3) {
              const actual = this.getVentana();
              if (element.tiempo === actual) {
                  this.urlIcon = element.urlIcono;
                  this.precipitacion = element.descripcion;
              }
          }
      });
  }

  getVentana(): string {
    let ventana; // Madrugada, Mañana, Tarde, Noche
    const date = new Date();
    if (date.getHours() >= 0 && date.getHours() <= 5) {
        ventana = 'Madrugada';
    }
    if (date.getHours() >= 6 && date.getHours() <= 11) {
        ventana = 'Mañana';
    }
    if (date.getHours() >= 12 && date.getHours() <= 17) {
        ventana = 'Tarde';
    }
    if (date.getHours() >= 18 && date.getHours() <= 23) {
        ventana = 'Noche';
    }
    return ventana;
  }

  cerrarClimaDetalle() {
    this.modalCtrl.dismiss();
  }

}

