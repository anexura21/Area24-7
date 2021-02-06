import { ModalController } from '@ionic/angular';
import { Common } from './../../shared/utilidades/common.service';
import { MessageService } from './../../providers/message.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'mideme-modal-calculation-save',
  templateUrl: './mideme-modal-calculation-save.component.html',
  styleUrls: ['./mideme-modal-calculation-save.component.scss'],
})
export class MidemeModalCalculationSaveComponent implements OnInit {

  @Input()
  color: string;

  msg: any;

  constructor(private messageProvider: MessageService,
              private common: Common,
              private modalCtrl: ModalController) { }

  ngOnInit() {
    // Consultamos el mensaje parametrizado que ira de encabezado
    this.messageProvider.getByNombreIdentificador('Huellas->Calculo->Guardado').subscribe(
      (response: any): void => {
        this.msg = response.json();
      },
      (error: any): any => {
      });
  }

  closeModal(): void {
    // this.common.dismissModal();
    this.modalCtrl.dismiss();
  }

}
