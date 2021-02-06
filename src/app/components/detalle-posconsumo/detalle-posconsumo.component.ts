import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'detalle-posconsumo',
  templateUrl: './detalle-posconsumo.component.html',
})
export class DetallePosconsumoComponent implements OnInit {

  @Input()
  tipo: string;
  @Input()
  info: any;
  @Input()
  color: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  closeModal(): void {
    this.modalCtrl.dismiss();
  }

  ir() {
    this.modalCtrl.dismiss({ir: true});
  }

}
