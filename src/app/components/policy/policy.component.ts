import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss'],
})
export class PolicyComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  goBack(): void {
    this.modalCtrl.dismiss();
}

}
