import { NavigationExtras, Router } from '@angular/router';
import { Common } from './../../shared/utilidades/common.service';
import { EncuestaService } from './../../providers/encuesta.service';
import { MidemeService } from './../../providers/mideme.service';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ControlBase } from './../../entities/forms/control-base';
import { DynamicFormComponent } from './../../components/dynamic-form/dynamic-form.component';
import { ControlsService } from 'src/app/providers/forms/controls.service';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { EncuestaModalComponent } from 'src/app/components/encuesta-modal/encuesta-modal.component';
import { EncuestaAlertaComponent } from 'src/app/components/encuesta-alerta/encuesta-alerta.component';

@Component({
  selector: 'encuesta',
  templateUrl: './encuesta.page.html',
  styleUrls: ['./encuesta.page.scss'],
})
export class EncuestaPage implements OnInit {

  @ViewChild(DynamicFormComponent)
  private DynamicFormComponent: DynamicFormComponent;
  form: FormGroup;
  submitted: any;
  controls: ControlBase<any>[];
  color: string;
  informacion: any[] = [];
  formulario: any[] = [];
  pregunta: any[] = []
  loading = false;
  contador = 0;
  idEncuesta: number;
  ultimo = 0;
  boton = 'Continuar';

  @Input()
  desdeI;

  desde = 'encuesta';

  valores: any[] = [];
  respuestas: any[] = [];

  @Input()
  encuesta: any;

  modal = false;
  finalizar = false;
  omitir = false;

  constructor(private controlsService: ControlsService,
              private alertCtrl: AlertController,
              private midemeService: MidemeService,
              private common: Common,
              private encuestaProvider: EncuestaService,
              private modalCtrl: ModalController,
              private navCtrl: NavController,
              private router: Router) {
    if (this.desdeI) {
      this.modal = true;
    }
    this.form = new FormGroup({});
  }

  ionViewWillLeave(): boolean {
    let canLeave: boolean = (this.contador === 0);
    if (this.omitir === true){
        canLeave = true;
        this.contador = 0;
    }
    if (!canLeave && this.contador < this.ultimo && this.omitir === false){
      this.restructurar();
    }
    if (!canLeave && this.finalizar === true && this.omitir === false){
      return true;
    }
    else{
        return canLeave;

    }
  }

  ngOnInit() {
    this.desde = 'encuesta';
    // Recorremos las preguntas y las llenamos en el array
    this.encuesta.preguntas.forEach((pregunta: any, i) => {
      this.ultimo = this.encuesta.preguntas.length;
      const opc: any[] = [];
      let image = '';

      if(pregunta.icono != null){
        image = pregunta.icono.rutaLogo;
      }

      if (pregunta.opcPreguntas.length > 0) {

        pregunta.opcPreguntas.forEach((opcion) => {
          opc.push({
            key: opcion.id,
            label: opcion.valor,
            idPregunta: opcion.idPregunta,
          });
        });

        this.formulario.push({
          display: 'selected',
          name: pregunta.id,
          required: pregunta.obligatorio,
          selected: false,
          image,
          title: pregunta.descripcion,
          type: pregunta.tipoPregunta.nombre,
          options: opc,
          orden: pregunta.orden,
          placeholder: opc[0].label,
          multiple: false,
        });

      }
      else {
        let placeholder: any = '';
        const min: any = 0;
        const max: any = 0;

        if (pregunta.tipoPregunta.nombre === 'Numero' || pregunta.tipoPregunta.nombre === 'Número') {
          placeholder = pregunta.minValue;
        }

        this.formulario.push({
          start: pregunta.minValue,
          end: pregunta.maxValue,
          name: pregunta.id,
          image,
          required: pregunta.obligatorio,
          selected: false,
          title: pregunta.descripcion,
          type: pregunta.tipoPregunta.nombre,
          options: opc,
          orden: pregunta.orden,
          placeholder,
          multiple: false,
        });
      }
      if (i + 1 === this.encuesta.preguntas.length) {
        this.formulario.sort((a, b) => b.orden > a.orden ? -1 : 1);
        this.loading = true;
        this.pregunta.push(this.formulario[0]);
        this.controls = this.controlsService.getControls(this.pregunta);
      }
    });

    this.form.valueChanges
      .subscribe(val => {
        this.submitted = val;
      });
  }

  restructurar(){
      this.formulario.forEach((element, i) => {
        if (element.name === this.pregunta[0].name){
          this.pregunta = [];
          this.pregunta.push(this.formulario[i - 1]);
          this.controls = this.controlsService.getControls(this.pregunta);
          this.contador = this.contador - 1;
          this.boton = 'Continuar';
          this.finalizar = false;
        }
      });
  }

  crearPregunta(params?: any) {
    // Validamos que la pregunta no tenga respuesta vacia
    let campoVacio: boolean;
    let limiteNumber: boolean;
    if (this.controls[0].controlType === 'checkbox'){
      const control: any = this.controls;
      control[0].options.forEach((element, i) => {
        if (this.form.value[element.key] === true){
          campoVacio = false;
        }
        if (i + 1 === control[0].options.length){
          if (campoVacio === undefined){
            campoVacio = true;
          }
        }
      });
    }

    else{
      if (this.controls[0].controlType === 'number') {
        const pregunta = this.formulario.find(x => x.name === this.controls[0].key);
        if (parseInt(this.submitted[pregunta.name], 0) > pregunta.end || parseInt(this.submitted[pregunta.name], 0) < pregunta.start){
          campoVacio = true;
          limiteNumber = true;
          this.common.appToast({ mensaje: `Debe ingresar un número entre ${pregunta.start} y ${pregunta.end}`,
                                 posicion: 'bottom', duration: 2000 });
        }
        if (limiteNumber === true || this.form.value[this.controls[0].key] === '') {
          campoVacio = true;
        }
      }
      else{
        if (this.form.value[this.controls[0].key] === '') {
          campoVacio = true;
        }
      }
    }

    if (campoVacio === true) {
      if(!limiteNumber){
        this.common.appToast({ mensaje: 'Debe ingresar una respuesta', posicion: 'bottom', duration: 2000 });
      }
    }
    else {
        const pregunta = this.formulario.find(x => x.name === this.controls[0].key);
        if (pregunta) {
          if (pregunta.type === 'Selección simple' || pregunta.type === 'Lista') {
            this.encuestaProvider.sendOption(pregunta.name, this.submitted[pregunta.name].key).subscribe((response) => {
            })
          }
          if (pregunta.type === 'Texto' || pregunta.type === 'Fecha' || pregunta.type === 'Número' || pregunta.type === 'Calificación') {
              this.encuestaProvider.sendResponse(pregunta.name, this.submitted[pregunta.name]).subscribe((response) => {
              })
          }
          if (pregunta.type === 'Selección múltiple') {
            for (const prop in this.form.value) {
              if (this.form.value[prop] === true) {
                const resultado = pregunta.options.find(x => x.key === prop);
                if(resultado){
                  this.encuestaProvider.sendOption(pregunta.name, resultado.key).subscribe((response) => {
                  })
                }
              }
            }
          }
        }
        this.loading = false;
        this.contador += 1;
        if (this.contador < this.ultimo) {
          setTimeout(() => {
            this.pregunta = [];
            this.pregunta.push(this.formulario[this.contador]);
            this.controls = this.controlsService.getControls(this.pregunta);
            this.loading = true;
          }, 500);
        }
        if ((this.contador + 1) === this.ultimo) {
          this.boton = 'Finalizar';
        }
        if (this.contador === this.ultimo) {
          this.finalizar = true;
          this.getEncuestaModal();
        }
      }
  }

  async getEncuestaModal() {
    const modal = await this.modalCtrl.create({
      component: EncuestaModalComponent,
      componentProps: {
        desde: 'encuesta',
        idEncuesta: this.encuesta.id
      }
    });
    await modal.onDidDismiss().then((response) => {
      if (response !== 'cerrarModal') {
        this.navCtrl.back();
      }else {
        // this.form.value[this.controls[0].key] = "";
        this.contador = this.contador - 2;
        this.crearPregunta(true);
      }
    });
    return await modal.present();
  }

  goToResult() {
    const navigateParamsL: NavigationExtras = {
      queryParams: {
          color: this.color,
          resultado: 160
      }
    };
    this.router.navigate([`/mideme-result`], navigateParamsL);
  }

  closeModal(){
    this.modalCtrl.dismiss();
  }

  async closePage() {
    this.omitir = true;
    const cancelarModal = await this.modalCtrl.create({
      component: EncuestaAlertaComponent
    });
    await cancelarModal.onDidDismiss().then((response) => {
      if (response !== 'cerrarModal') {
        this.navCtrl.back();
      }
      else{
          this.omitir = false;
      }
    });
    return await cancelarModal.present();
  }


}
