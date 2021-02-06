import { ModalController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { EncuestaService } from './../../providers/encuesta.service';
import { Common } from './../../shared/utilidades/common.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'encuesta-modal',
  templateUrl: './encuesta-modal.component.html',
  styleUrls: ['./encuesta-modal.component.scss'],
})
export class EncuestaModalComponent implements OnInit {

  text: string;

  @Input()
  desde: string;
  titulo: string;
  mensaje: string;
  nombreEncuesta: string;
  boton: string;

  @Input()
  color: string;

  @Input()
  idEncuesta: number;

  encuesta: any;

  constructor(private common: Common,
              private encuestProvider: EncuestaService,
              private router: Router,
              private modalCtrl: ModalController) {
                this.text = 'Hello World';
              }

  ngOnInit() {
    this.encuestProvider.getEncuesta().subscribe((response: any) => {
      response.forEach((formulario, i) => {
        if (formulario.id === this.idEncuesta){
          this.encuesta = formulario;
          this.nombreEncuesta = formulario.nombre;
          console.log('encuestaID', this.idEncuesta);
          console.log('encuesta', response);
        }
      });
    });
    if (this.desde === 'app'){
      this.titulo = '¡Tenemos una encuesta para ti!';
      this.mensaje = 'Te invitamos a responder esta encuesta sobre';
      this.boton = 'Responder encuesta';
    }
    else{
      this.titulo = '¡Gracias por tus respuestas!';
      this.mensaje = 'Gracias por responder a esta encuesta sobre';
      this.boton = 'Finalizar';
    }
  }

  irEncuesta(){
    if (this.desde === 'app'){
      this.encuestProvider.completeEncuesta(this.idEncuesta).subscribe((response) => {
      });
      const navigateParamsL: NavigationExtras = {
        queryParams: {
            encuesta: this.encuesta
        }
      };
      this.router.navigate([`/encuesta`], navigateParamsL);
      // this.common.dismissModal();
      this.modalCtrl.dismiss();
    }
    else{
      // this.common.dismissModal();
      this.modalCtrl.dismiss();
    }
  }

  closeModal(): void {
    this.encuestProvider.completeEncuesta(this.idEncuesta).subscribe((response) => {
    });
    this.modalCtrl.dismiss('cerrarModal');
  }


}
