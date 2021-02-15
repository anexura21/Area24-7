import { ModalController } from '@ionic/angular';
import { Common } from './../../shared/utilidades/common.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-horarios-encicla-modal',
  templateUrl: './horarios-encicla-modal.component.html',
  // styleUrls: ['./horarios-encicla-modal.component.scss'],
})
export class HorariosEnciclaModalComponent implements OnInit {

  @Input()
  horario: any;
  titulo = '¡Ups! En este momento el servicio de EnCicla no está disponible.';
  mensaje1 = 'Los horarios de atención son: Lunes a viernes de ';
  mensaje2 = 'Sábados de ';
  mensajePrestamo = '(último préstamo a las ';

  horaInicioSemana;
  horaInicioSabado;
  horaFinSemana;
  horaFinSabado;
  horaPrestamoSenana;
  horaPrestamoSabado;

  appContext: any;
  @Input()
  app: any;

  constructor(private common: Common,
              private modalCtrl: ModalController
    ){
        this.appContext = this.app;

        this.horaPrestamoSenana = this.horario.horaUltimoPrestamo;
        this.horaPrestamoSabado = this.horario.horaUltimoPrestamoSabado; 

        this.horaInicioSemana = this.horario.horaInicio;
        this.horaFinSemana = this.horario.horaFin;
        this.horaInicioSabado = this.horario.horaInicioSabado;
        this.horaFinSabado = this.horario.horaFinSabado;
      }

  ngOnInit() {}

  closeModal(){
    this.modalCtrl.dismiss();
  }

}
