import { MidemeModalPersonalChallengeComponent } from './../../../components/mideme-modal-personal-challenge/mideme-modal-personal-challenge.component';
import { MidemeModalChangeChallengeComponent } from './../../../components/mideme-modal-change-challenge/mideme-modal-change-challenge.component';
import { MidemeModalSelectChallengeComponent } from './../../../components/mideme-modal-select-challenge/mideme-modal-select-challenge.component';
import { ModalController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { MidemeService } from './../../../providers/mideme.service';
import { Common } from './../../../shared/utilidades/common.service';
import { MessageService } from './../../../providers/message.service';
import { MockService } from './../../../shared/mock/mock.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'mideme-challenge',
  templateUrl: './mideme-challenge.page.html'
})
export class MidemeChallengePage implements OnInit, OnDestroy {

  public color: string;
  private retos: any[] = [];
  private retosUsuario: any[] = [];
  private msg: any = {};
  private loading: boolean;

  public challenges: any[] = [];
  private activeChallenge: any;

  constructor(private servicesMock: MockService,
              private messageProvider: MessageService,
              private common: Common,
              private midemeProvider: MidemeService,
              private routerActual: ActivatedRoute,
              private modalCtrl: ModalController,
              private navCtrl: NavController,
              private router: Router) {
    this.routerActual.queryParams.subscribe( params => {
      console.log('Color: ', params['color']);
      this.color = params['color'];
    });
               }

  ngOnInit() {
    this.messageProvider.getByNombreIdentificador('Retos->Lista->Encabezado').subscribe(
      (response: any): void => {
        console.log(MidemeChallengePage.name + 'Lista de retos getByNombreIdentificador ' + JSON.stringify(response));
        this.msg = response;
      },
      (error: any): any => {
        console.log(MidemeChallengePage.name + 'Lista de retos error getByNombreIdentificador error' + JSON.stringify(error));
      }
    );
  }

  ionViewDidEnter() {
    this.challenges = [];
    this.retos = [];
    this.cargarInfo();
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    console.log('onDestroy');
    this.challenges = [];
    this.activeChallenge = undefined;
  }

  // ngOnInit() {
  //   this.cargarInfo();
  // }

  cargarInfo() {
    console.log('Cargar info');
    this.challenges = [];
    this.retos = [];
    this.loading = true;
    this.midemeProvider.getChallenges().subscribe(
      (retos: any): void => {

        this.midemeProvider.getChallengeUser().subscribe(
          (retoUsuario: any): void => {
            this.loading = false;

            this.activeChallenge = retoUsuario.filter((reto) => reto.estado === true);
            console.log('RETO ACTIVO', this.activeChallenge);


            retos.forEach((categoria, i) => {
              if (categoria.categoriaReto === 'PERSONAL'){
                categoria.orden = 1;
              }
              else{
                categoria.orden = i + 2;

              }
              categoria.retos.forEach((element) => {


                if (this.activeChallenge.length > 0) {
                  if (element.id === this.activeChallenge[0].retoId) {
                    if (this.activeChallenge[0].tipoRetoEnum === 'PERSONAL'){
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

            });
          });
      });
    console.log('Categorías ', this.challenges);
  }

  async getModalsChallenge(component: any, tipoReto?: any) {
    const modal = await this.modalCtrl.create({
      component: MidemeModalSelectChallengeComponent,
      componentProps: {
        color: this.color,
        challenge: this.activeChallenge[0],
        desde: 'Retos',
        reto: tipoReto,
      }
    });
    modal.onDidDismiss().then((resultado: any) => {
      if (resultado.categoriaReto === 'PREDETERMINADO') {
        const modalSelect = this.modalCtrl.create({
          component: MidemeModalSelectChallengeComponent,
          componentProps: {
            color: this.color,
            challenges: tipoReto,
            desde: 'Cancelar'
          }
        });
      }
    });
    return await modal.present();
  }

  async getModalSelectChallenge(tipoReto: any) {
    console.log('getModalSelectChallenge');
    const seleccionarRetoModal = await this.modalCtrl.create(
      {
        component: MidemeModalSelectChallengeComponent,
        componentProps:
      {
        challenges: tipoReto,
        desde: 'Cancelar',
        color: this.color,
      }
     });
    seleccionarRetoModal.onDidDismiss().then((respuesta: any) => {
      this.cargarInfo();
    });
    return await seleccionarRetoModal.present();
  }

  async getModalPersonalChallenge( tipoReto: any) {
    console.log('getModalPersonalChallenge');
    const personalModal = await this.modalCtrl.create(
      {
        component: MidemeModalPersonalChallengeComponent,
        componentProps:
      {
        desde: 'Retos',
        color: this.color,
        challenges: tipoReto
      }
    });
    personalModal.onDidDismiss().then((respuesta: any) => {
      if (respuesta === 'inicio'){
        this.cargarInfo();
      }
      if (respuesta.cerrar === true) {
        this.navCtrl.pop();
      }
    });
    await personalModal.present();
  }

  async getModalChangeChallenge(tipoReto: any) {
    console.log('Modal Change Challenge');
    const modal = await this.modalCtrl.create({
      component: MidemeModalChangeChallengeComponent,
      componentProps:
      {
        color: this.color,
        challenge: this.activeChallenge[0],
        desde: 'Retos',
        reto: tipoReto
      }
    });
    console.log('Modal puede aparecer');
    modal.onDidDismiss().then((resultado: any) => {
      if (resultado.categoriaReto === 'PREDETERMINADO') {
        this.getModalSelectChallenge(tipoReto);
      }
      else {
        if (resultado !== 'cancelar'){
          this.getModalPersonalChallenge(tipoReto);
        }
        }
    });
    console.log('Modal puede aparecer...');
    await modal.present();
  }

  goToCancelChallenge(tipoReto: any): void {
    if (this.activeChallenge.length > 0) {
      this.activeChallenge[0].estado = false;
      console.log('Cambiar reto: ' + JSON.stringify(this.activeChallenge[0]));
      this.getModalChangeChallenge(tipoReto);
    } else {
      console.log('No hay reto activo');
      this.goChallengeModal(tipoReto);
    }

  }

  goToCurrentChallenge(reto: any) {
    console.log('Reto actual: ' + JSON.stringify(reto));
    const navigationExtras: NavigationExtras = {
      queryParams: {
        color: this.color
      }
    };
    this.router.navigate(['/mideme-current-challenge', this.activeChallenge[0]], navigationExtras);
  }

  async goChallengeModal(tipoReto: any) {
    console.log('Caegoría reto ', tipoReto);
    if (tipoReto.categoriaReto === 'PREDETERMINADO') {
      const seleccionarRetoModal = await this.modalCtrl.create({
        component: MidemeModalSelectChallengeComponent, componentProps: { challenges: tipoReto, color: this.color,}});
      seleccionarRetoModal.onDidDismiss().then((respuesta: any) => {
        if (respuesta.cerrar === true) {
          this.cargarInfo();
        }
      });
      seleccionarRetoModal.present();
    }
    else {
      const personalModal = await this.modalCtrl.create({component: MidemeModalPersonalChallengeComponent,
        componentProps: {
          desde: 'Retos',
          color: this.color,
          challenges: tipoReto
        }});
      personalModal.onDidDismiss().then((respuesta: any) => {
        if (respuesta.cerrar === true) {
          this.navCtrl.pop();
          this.navCtrl.pop();
        }
        else {
          this.cargarInfo();
        }
      });
      personalModal.present();
    }
  }



}
