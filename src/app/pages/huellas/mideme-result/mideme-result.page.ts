import { MidemeModalCalculationSaveComponent } from './../../../components/mideme-modal-calculation-save/mideme-modal-calculation-save.component';
import { MidemeModalSelectChallengeComponent } from './../../../components/mideme-modal-select-challenge/mideme-modal-select-challenge.component';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { MidemeService } from './../../../providers/mideme.service';
import { MessageService } from './../../../providers/message.service';
import { Common } from './../../../shared/utilidades/common.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mideme-result',
  templateUrl: './mideme-result.page.html'
})
export class MidemeResultPage implements OnInit {

  color: string;
  clase = 'meh';
  nivel = 'Medio';
  valor: number;
  resultado: any;
  private retos: any[] = [];
  private retosUsuario: any[] = [];
  private msg: any = {};
  private loading: boolean;
  retoPersonal: any;

  private challenges: any[] = [];
  private activeChallenge: any;

  constructor(private common: Common,
              private messageProvider: MessageService,
              private midemeProvider: MidemeService,
              private routerActual: ActivatedRoute,
              private modalCtrl: ModalController) {
    this.routerActual.queryParams.subscribe( params => {
      console.log('Color: ', params['color']);
      this.color = params['color'];
      // this.resultado = params['respuesta'];
      // console.log(this.resultado);
      // this.valor = params['respuesta'];
    });
    this.routerActual.params.subscribe( respuesta => {
      console.log(respuesta);
      this.resultado = respuesta;
    });
  }

  ngOnInit() {
    this.messageProvider.getByNombreIdentificador('Huellas->Calculo').subscribe(
      (response: any): void => {
        this.msg = response.json();
        console.log(MidemeResultPage.name + 'Resultado de calculo getByNombreIdentificador ' + JSON.stringify(response));
        console.log('MENSAJE', this.msg);
      },
      (error: any): any => {
        console.log(MidemeResultPage.name + 'Resultado de calculo error getByNombreIdentificador error' + JSON.stringify(error));
      }
    );
    this.cargarInfo();
  }

  cargarInfo() {
    this.challenges = [];
    this.retos = [];
    this.loading = true;
    this.midemeProvider.getChallenges().subscribe(
      (retos: any): void => {

        this.midemeProvider.getChallengeUser().subscribe(
          (retoUsuario: any): void => {
            this.loading = false;

            this.activeChallenge = retoUsuario.filter((reto) => reto.estado === true);
            retos.forEach((categoria, i) => {
              if (categoria.categoriaReto === 'PERSONAL'){
                this.retoPersonal = categoria;
                categoria.orden = 1;
              }
              else{
                categoria.orden = i + 2;

              }
              categoria.retos.forEach((element) => {

              if (this.activeChallenge.length > 0) {
                if (element.id === this.activeChallenge[0].retoId) {
                  if(this.activeChallenge[0].tipoRetoEnum === 'PERSONAL'){
                    element.nombre = this.activeChallenge[0].retoUsuarioTextoReto;
                  }
                  element.activo = true;
                  categoria.activo = true;
                } else {
                  element.activo = false;
                  categoria.activo = (categoria.activo !== true) ? false : true;
                }
              } else {
                element.activo = false;
                categoria.activo = false;
              }

              this.retos.push(element);
            });
              this.challenges.push(categoria);
              this.challenges.sort((a, b) => b.orden > a.orden ? -1 : 1);
              console.log('retos', this.challenges);
            });
          });
      });
  }

  async goToAcceptChallenge() {
    const modal = await this.modalCtrl.create({
      component: MidemeModalSelectChallengeComponent,
      componentProps: {
        challengeCategory: 'Baño'
      }
    });
    return await modal.present();
  }

  async goToDeclineChallenge(){
    const modal = await this.modalCtrl.create({
      component: MidemeModalCalculationSaveComponent,
      componentProps: {
        color: this.color
      }
    });
    await modal.onDidDismiss().then( response => {
      this.modalCtrl.dismiss();
      this.modalCtrl.dismiss();
    });
    return modal.present();
  }

}
