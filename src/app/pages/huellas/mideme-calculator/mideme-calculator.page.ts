import { MessageService } from './../../../providers/message.service';
import { Common } from './../../../shared/utilidades/common.service';
import { EncuestaService } from './../../../providers/encuesta.service';
import { AlertController, ModalController } from '@ionic/angular';
import { LayerService } from './../../../providers/layer.service';
import { MidemeService } from './../../../providers/mideme.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ControlBase } from './../../../entities/forms/control-base';
import { DynamicFormComponent } from './../../../components/dynamic-form/dynamic-form.component';
import { ControlsService } from './../../../providers/forms/controls.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { MidemeModalSelectChallengeComponent } from './../../../components/mideme-modal-select-challenge/mideme-modal-select-challenge.component';

@Component({
  selector: 'mideme-calculator',
  templateUrl: './mideme-calculator.page.html',
})
export class MidemeCalculatorPage implements OnInit {

  @ViewChild('dynamicForm')
  private DynamicFormComponent: DynamicFormComponent;
  form: FormGroup;
  submitted: any;
  controls: ControlBase<any>[];
  color: string;
  informacion: any[] = [];
  formulario: any[] = [];
  loading = false;
  idFormulario: number;
  appId: number;
  desde = 'formulario';
  instrucciones: any;
  boton = 'Calcular consumo';

  constructor(private controlsService: ControlsService,
              private alertCtrl: AlertController,
              private midemeService: MidemeService,
              private layerProvider: LayerService,
              private common: Common,
              private encuestaProvider: EncuestaService,
              private messageProvider: MessageService,
              private routerActual: ActivatedRoute,
              private router: Router,
              private modalCtrl: ModalController) {
    console.log('Calculator component');
    this.routerActual.queryParams.subscribe( params => {
      console.log('Color: ', params['color']);
      this.color = params['color'];
      this.form = new FormGroup({});
    });
              }

  ngOnInit() {
    console.log('OnInit Calculator component');
    this.messageProvider.getByNombreIdentificador('Huellas->Calculadora').subscribe(
      (response: any): void => {
        console.log(MidemeCalculatorPage.name + 'Intrucciones de calculo getByNombreIdentificador ' + JSON.stringify(response));
        this.instrucciones = response;
      },
      (error: any): any => {
        console.log(MidemeCalculatorPage.name + 'Intrucciones de calculo ERROR getByNombreIdentificador ' + JSON.stringify(error));
      });
    // Consultamos el formulario asociado a la aplicacion MIDEME
    this.midemeService.getFormularioId().subscribe((formularioMideme: any) => {
      console.log(formularioMideme);
      let preguntas: any[];
      this.idFormulario = formularioMideme[0].id;
      preguntas = formularioMideme[0].preguntas;
      // Recorremos las preguntas y las llenamos en el array
      preguntas.forEach((pregunta: any, i) => {
        let opc: any[] = [];
        if (pregunta.tipoPregunta.nombre === 'Selección simple') {
          pregunta.opcPreguntas.forEach((opcion) => {
            opc.push({
              key: opcion.id,
              label: opcion.clave,
              idPregunta: pregunta.id,
            });
          });
          this.formulario.push({
            display: 'selected',
            name: pregunta.id,
            required: pregunta.obligatorio,
            selected: false,
            title: pregunta.descripcion,
            type: pregunta.tipoPregunta.nombre,
            options: opc,
            orden: pregunta.orden,
            placeholder: opc[0].label,
            multiple: false,
          });
        }
        else {
          let placeholder = '';
          const min: any = 0;
          const max: any = 0;
          if (pregunta.tipoPregunta.nombre === 'Numero') {
            placeholder = '0';
          }

          // Si la pregunta es booleana creamos las 2 opciones SI/No
          if (pregunta.tipoPregunta.nombre === 'Booleana') {
            opc = [
              {
                Pregunta: pregunta.tipoPregunta.id,
                clave: 'Sí',
                id: pregunta.tipoPregunta.id,
                idPregunta: pregunta.id,
                new: false,
                valor: 'Sí',
                label: 'Sí',
              },
              {
                Pregunta: pregunta.tipoPregunta.id,
                clave: 'No',
                id: pregunta.tipoPregunta.id,
                new: false,
                valor: 'No',
                label: 'No',
              }
            ];
            placeholder = 'Sí';
          }

          this.formulario.push({
            start: pregunta.minValue,
            end: pregunta.maxValue,
            name: pregunta.id,
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
        // Cuando se termina de recorrer se apaga el cargador y se ordenan las preguntas
        if (i + 1 === preguntas.length) {
          this.loading = true;
          this.formulario.sort((a, b) => b.orden > a.orden ? -1 : 1);
          this.controls = this.controlsService.getControls(this.formulario);
        }
        });
        });
    this.form.valueChanges.subscribe(val => {
      this.submitted = val;
    });
  }

  goToResult(): void {
    const respuestas: any[] = [];
    // Se valida que todas las preguntas han sido respondidas
    let campoVacio = false;
    for (const prop in this.form.value) {
      if (this.form.value[prop] === '' || this.form.value[prop] === '') {
                campoVacio = false;
                const propN = Number(prop);
                const resultado = this.formulario.find(x => x.name === propN);
                if (resultado.type === 'Número'){
                    this.form.value[prop] = resultado.start;
                }
                if (resultado.type === 'Booleana'){
                    this.form.value[prop] = 'true';
                }
                if (resultado.type === 'Selección simple'){
                    this.form.value[prop] = resultado.options[0].label;
                }
      }
    }
    if (campoVacio) {
      this.common.appToast({ mensaje: 'Debe responder todas las preguntas', posicion: 'bottom', duration: 2000 });
    }
    else {
      this.common.presentLoading();
      for (const prop in this.form.value) {
          if (this.form.value.hasOwnProperty(prop)){
            const valor = Number(prop);
            let respuesta: any;
            const resultado = this.formulario.find(x => x.name === valor);
            // Si las preguntas son seleccion simple se debe enviar como respuestas
            // Todas sus opciones y solo en estado true la que selecciono las demas en estado false
            if (resultado.options.length >= 1 && resultado.type === 'Selección simple') {
                resultado.options.forEach(option => {
                // Si es la opcion que se selecciono se pone true
                if (option.key == this.form.value[prop].key) {
                  respuesta = 'true';
                }
                else {
                  respuesta = 'false';
                }
                respuestas.push({
                  idOpcRespuesta: option.key,
                  idPregunta: option.idPregunta,
                  respuesta,
                })
              });
            }
            else {
              if (this.form.value[prop].clave) {
                if (this.form.value[prop].clave === 'No') {
                  respuesta = 'false';
                }
                else {
                  respuesta = 'true';
                }
              }
              else {
                respuesta = this.form.value[prop];
              }
              respuestas.push({
                idPregunta: valor,
                respuesta,
              })
            }
          }
        }

      // Creamos el objeto a enviar al servicio
      const consumoDto: any =
      {
        idFormulario: this.idFormulario,
        preguntasRespuestas: respuestas,
        username: localStorage.getItem('username'),
      };
      this.midemeService.postCalculator(consumoDto).subscribe((respuesta: any) => {
        this.common.dismissLoading();
        // Enviamos informacion del formulario para obtener un resultado
        const navigateParamsL: NavigationExtras = {
          queryParams: {
              color: this.color,
              // respuesta,
              // resultado: respuesta
          }
        };
        this.router.navigate([`/mideme-result`, respuesta], navigateParamsL);
      },
        (error: any): any => {
          console.log('error al calcular');
        });
    }

  }

  async goChallengeModal() {
    const modal = await this.modalCtrl.create({
      component: MidemeModalSelectChallengeComponent,
      componentProps: {
        challengeCategory: 'Baño'
      }
    });
    return await modal.present();
  }


}
