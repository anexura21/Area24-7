import { MidemeModalChangeChallengeComponent } from 'src/app/components/mideme-modal-change-challenge/mideme-modal-change-challenge.component';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { MessageService } from './../../../providers/message.service';
import { NavController, ModalController } from '@ionic/angular';
import { Common } from './../../../shared/utilidades/common.service';
import { MockService } from './../../../shared/mock/mock.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mideme-current-challenge',
  templateUrl: './mideme-current-challenge.page.html'
})
export class MidemeCurrentChallengePage implements OnInit {

  color: string;
  dias: number;
  progressdias: any;
  reto: any;
  estado: any;
  encabezado: any;
  diasNoCumplidos: any;
  textoReto = '';

  constructor(private navCtrl: NavController,
              private common: Common,
              private servicesMock: MockService,
              private messageProvider: MessageService,
              private routerActual: ActivatedRoute,
              private router: Router,
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
                  this.reto = respuesta;
                });
                if (this.reto.tipoRetoEnum === 'PERSONAL'){
                  this.textoReto = this.reto.retoUsuarioTextoReto;
                }
                else{
                  this.textoReto = this.reto.retoTexto;
                }
                console.log('texto', this.textoReto);

                console.log('Active Challenge: ', this.reto);
              }

  ngOnInit() {
    const circle = document.getElementById('barra');
    // Se consulta los mensajes parametrizables para el encabezado
    this.messageProvider.getByNombreIdentificador('Huellas->Reto->Actual').subscribe(
      (response: any) => {
        console.log(MidemeCurrentChallengePage.name + 'Encabezado reto actual getByNombreIdentificador ' + JSON.stringify(response));
        this.encabezado = response;
      },
      (error: any): any => {
        console.log(MidemeCurrentChallengePage.name +
          'Encabezado reto actual error getByNombreIdentificador error' + JSON.stringify(error));
      }
    );
    // Animacion de la barra de progreso
    let dias = 0;
    this.progressdias = `progress-${dias}`;
    // Intervalo que se ejecutara cada 100ms hasta llegar al dia en curso
    const timer: any = setInterval(() => {
      this.progressdias = `progress-${dias}`;
      let factor: any;
      if (dias <= 10) {
        factor = 90 + 17.14 * dias;
        circle.style.backgroundImage = `linear-gradient(90deg, #ccc 50%, #0000 50%, #0000), linear-gradient(${factor}deg, ${this.color} 50%, #ccc 50%, #ccc)`;
      }
      else {
        factor = -90 + 17.14 * (dias - 10.5);
        circle.style.backgroundImage = `linear-gradient(${factor}deg,${this.color} 50%, #0000 50%, #0000), linear-gradient(270deg, ${this.color} 50%, #ccc 50%, #ccc)`;
      }
      if (dias === parseInt(this.reto.diaEnCurso, 0)) {
        clearInterval(timer);
      }
      dias = dias + 1;
    }, 100);
    this.diasNoCumplidos = (parseInt(this.reto.diaEnCurso, 0) - parseInt(this.reto.diasCumplidos, 0));
    if (this.diasNoCumplidos < 0){
      this.diasNoCumplidos = 0;
    }
  }

  finishChallenge(){
    this.messageProvider.getByNombreIdentificador('Huellas->Reto->Finalizado').subscribe(
      (mensaje: any): void => {
        this.common.basicAlePrtCss(mensaje.json().titulo, mensaje.json().descripcion, 'sGenRep alertAv btnSolo', 'Calcular')
        .then((alert) => {
          const navigateParamsL: NavigationExtras = {
            queryParams: {
                color: this.color
            }
          };
          this.router.navigate(['/mideme-calculator'], navigateParamsL);
        });
      },
      (error: any): any => {
        console.log(MidemeCurrentChallengePage.name +
          'Encabezado de historia ERROR getByNombreIdentificador ' + JSON.stringify(error));
      });
  }

  async cancelChallenge() {
    this.reto.estado = false;
    const modal = await this.modalCtrl.create(
      {
        component: MidemeModalChangeChallengeComponent,
        componentProps:
       { challenge: this.reto,
          desde: 'CurrentChallenge'}
       });
    await modal.onDidDismiss().then((response: any) => {
      if (response.cerrar === true) {
        this.navCtrl.pop();
      }
    });
    return await modal.present();
  }

}
