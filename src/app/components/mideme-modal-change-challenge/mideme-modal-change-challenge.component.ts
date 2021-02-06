import { ModalController } from '@ionic/angular';
import { MidemeModalSelectChallengeComponent } from './../mideme-modal-select-challenge/mideme-modal-select-challenge.component';
import { MessageService } from './../../providers/message.service';
import { Common } from './../../shared/utilidades/common.service';
import { MockService } from './../../shared/mock/mock.service';
import { MidemeService } from './../../providers/mideme.service';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'mideme-modal-change-challenge',
  templateUrl: './mideme-modal-change-challenge.component.html'
})
export class MidemeModalChangeChallengeComponent {

  text: string;
  @Input()
  challenge: any;
  titulo: any;
  @Input()
  desde: string;
  @Input()
  color: string;
  @Input()
  reto: any;

  constructor(private common: Common,
              private midemeprovider: MidemeService,
              private serviceMock: MockService,
              private messageProvider: MessageService,
              private modalCtrl: ModalController) {
                console.log('Entró modal change Challenge');
                this.text = 'Hello World';
                console.log('Challente to cancel ', this.challenge);
              }

  ionViewWillEnter() {
    if (this.desde === 'Retos') {
      this.messageProvider.getByNombreIdentificador('Huellas->Cambiar->Reto').subscribe(
        (response: any): void => {
          console.log(MidemeModalSelectChallengeComponent.name +
            'Encabezado de historia getByNombreIdentificador ' + JSON.stringify(response));
          this.titulo = response;
        },
        (error: any): any => {
          console.log(MidemeModalSelectChallengeComponent.name +
            'Encabezado de historia ERROR getByNombreIdentificador ' + JSON.stringify(error));
        });
    } else {
      this.messageProvider.getByNombreIdentificador('Huellas->Cancelar->Reto').subscribe(
        (response: any): void => {
          console.log(MidemeModalSelectChallengeComponent.name +
            'Encabezado de historia getByNombreIdentificador ' + JSON.stringify(response));
          this.titulo = response;
        },
        (error: any): any => {
          console.log(MidemeModalSelectChallengeComponent.name +
            'Encabezado de historia ERROR getByNombreIdentificador ' + JSON.stringify(error));
        });
    }
  }

  closeModal() {
    this.modalCtrl.dismiss('cancelar');
  }

  cancel(): void {
    this.serviceMock.cancel(this.challenge);

    this.midemeprovider.updateCurrentChallenge(this.challenge).subscribe((response: Response) => {
      console.log(MidemeModalChangeChallengeComponent.name, 'cancelChallenge', response);
    });

    if (this.desde === 'CurrentChallenge'){
      this.modalCtrl.dismiss( {cerrar: true} );
    }else{
      this.modalCtrl.dismiss( this.reto );
    }
  }

}
