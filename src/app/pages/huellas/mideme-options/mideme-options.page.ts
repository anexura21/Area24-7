import { Layer } from './../../../entities/layer';
import { AppLayer } from './../../../entities/app-layer';
import { MidemeModalCheckChallengeComponent } from './../../../components/mideme-modal-check-challenge/mideme-modal-check-challenge.component';
import { ModalController } from '@ionic/angular';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserHistory } from './../../../entities/userHistory';
import { MidemeService } from './../../../providers/mideme.service';
import { Common } from './../../../shared/utilidades/common.service';
import { EncuestaModalComponent } from './../../../components/encuesta-modal/encuesta-modal.component';

@Component({
  selector: 'mideme-options',
  templateUrl: './mideme-options.page.html'
})
export class MidemeOptionsPage implements OnInit {


  color: string;
  options = false;
  private layer: Layer;

  constructor(private midemeProvider: MidemeService,
              private common: Common,
              private router: Router,
              private route: ActivatedRoute,
              private modalCtrl: ModalController) {

                this.route.queryParams.subscribe( params => {
                  //   this.appLayer = JSON.parse(params['app']);
                  //   this.appLayer.children = JSON.parse(params['children']);
                  this.color = params['color'];
                  this.layer = new Layer({});
                  console.log(params['layerName']);
                  this.layer.name = params['layerName'];
                  console.log(this.layer.name);
                  // this.layer = JSON.parse(params['layer']);
                  });
                // this.route.params.subscribe(( data ) => {
                //     console.log(data);
                //     this.layer = data;
                //     this.layer.name = this.layer._name;
                //     console.log(this.layer.name);
                // });
              }

  ngOnInit() {
    this.midemeProvider.getHistoryFromService().subscribe(response => {
      console.log('This are the history registers: ', response);
      if (response.length >= 1){
        this.options = true;
      }
    });
  }

  ionViewDidEnter(){
    this.midemeProvider.getHistoryFromService().subscribe( response => {
      console.log('This are the history registers: ', response);
      if (response.length >= 1){
        this.options = true;
      }
    });
  }

  goToCalculator() {
    const navigateParamsL: NavigationExtras = {
      queryParams: {
          color: this.color
      }
    };
    this.router.navigate(['/mideme-calculator'], navigateParamsL);
  }

  async encuesta() {
    const modal = await this.modalCtrl.create({
      component: EncuestaModalComponent,
      componentProps: {
        desde: 'app'
      }
    });
    return await modal.present();
  }

  goToHistory() {
    const navigateParamsL: NavigationExtras = {
      queryParams: {
          color: this.color
      }
    };
    this.router.navigate([`/mideme-history`], navigateParamsL);
  }

  goToChallenge() {
    const navigateParamsL: NavigationExtras = {
      queryParams: {
          color: this.color
      }
    };
    this.router.navigate([`/mideme-challenge`], navigateParamsL);
  }

  async goToCheckChallenge() {
    const modal = await this.modalCtrl.create({
      component: MidemeModalCheckChallengeComponent,
      componentProps: {
        color: this.color
      }
    });
    return await modal.present();
  }

}
