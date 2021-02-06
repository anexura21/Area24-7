import { ModalController } from '@ionic/angular';
import { Common } from './../../shared/utilidades/common.service';
import { LayerService } from './../../providers/layer.service';
import { MidemeService } from './../../providers/mideme.service';
import { Component, Input, OnInit } from '@angular/core';
import { AppLayer } from './../../entities/app-layer';
import { data } from 'jquery';

@Component({
  selector: 'mideme-modal-select-challenge',
  templateUrl: './mideme-modal-select-challenge.component.html',
  styleUrls: ['./mideme-modal-select-challenge.component.scss'],
})
export class MidemeModalSelectChallengeComponent implements OnInit {

  // listOfChallenges: Array<string>;
  @Input()
  category: any;

  app: AppLayer;

  challenges: any[] = [];

  challenge: string = undefined;

  @Input()
  color: string;

  @Input()
  desde: string;

  clase: string;
  modalSize = '80%';

  constructor(private common: Common,
              private midemeProvider: MidemeService,
              private layerProvider: LayerService,
              private modalCtrl: ModalController) {

               }

  ngOnInit() {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.category.retos.forEach(element => {
      this.challenges.push(element);
    });
    if (this.challenges.length < 4){
        this.modalSize = '40%';
    }
  }

  selectedRadio(item): void {
    this.challenge = item;
    item.seleccionado = true;
    this.challenges.forEach(element => {
        if (element.id !== item.id && element.seleccionado == true) {
            element.seleccionado = false;
        }
    });
}

challengeAccepted(): void {
    if (this.challenge) {
        this.midemeProvider.postSelectChallenge(this.challenge).subscribe((response: Response) => {
            console.log(MidemeModalSelectChallengeComponent.name, 'ChallengeAccepted', response);
        });
        if (this.desde === 'Cancelar') {
            this.common.dismissModal('inicio');
        }
        else {
            if (this.desde === 'Resultado') {
                this.common.dismissModal('acepto');
            }
            else {
                this.common.dismissModal({ cerrar: true });
            }
        }
    }
    else {
        this.common.appToast({ mensaje: 'No has seleccionado ningún reto', posicion: 'bottom', duration: 2000 });
    }
}

closeModal(): void {
    // this.common.dismissModal({ cerrar: false });
    this.modalCtrl.dismiss({ cerrar: false });
}

tap(item: any) {
    this.challenge = item;
    item.seleccionado = true;
    this.challenges.forEach(element => {
        if (element.id !== item.id && element.seleccionado === true) {
            element.seleccionado = false;
        }
    });
}

}
