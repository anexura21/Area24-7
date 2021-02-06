import { ModalController } from '@ionic/angular';
import { Common } from './../../shared/utilidades/common.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'menu-modal',
  templateUrl: './menu-modal.component.html',
})
export class MenuModalComponent implements OnInit {

  @Input() titulo: string;
  @Input() color: string;
  // @Input() viewCtrl?: ViewController;

  constructor(private common: Common,
              private modalCtrl: ModalController) {
    console.log('Hello MenuModalComponent Component');
   }

  ngOnInit() {
    if (!this.color){
      this.color = '#0060B6';
    }
  }

  closeModal( event: any ){
    this.modalCtrl.dismiss();
  }

}
