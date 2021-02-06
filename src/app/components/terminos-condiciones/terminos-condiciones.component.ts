import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'terminos-condiciones',
  templateUrl: './terminos-condiciones.component.html',
  styleUrls: ['./terminos-condiciones.component.scss'],
})
export class TerminosCondicionesComponent implements OnInit {

  @Input()
  private acceptButtons;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  ionViewWillEnter() {
    console.log('ionViewDidLoad TerminosCondicionesPage');
  }

  closeModal(acceptTerms: boolean) {
    this.modalCtrl.dismiss(acceptTerms);
  }

  goBack() {
    this.modalCtrl.dismiss();
  }

}
