import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IonApp, IonSelect } from '@ionic/angular';
import { DynamicControlsService } from '../../providers/forms/dynamic-controls.service';
import { Common } from '../../shared/utilidades/common.service';
import { ControlBase } from '../../entities/forms/control-base';

@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html'
})
export class DynamicFormComponent implements OnInit, OnDestroy {

  @ViewChild('pregunta') select: IonSelect;
  @ViewChild('preguntaSeleccion') preguntaSeleccion: IonSelect;
  @Input() controls: ControlBase<any>[] = [];
  @Input() public desde: string;
  @Input() public colorApp: string;
  @Input() form: FormGroup;
  @Output() eSubmit: EventEmitter<any> = new EventEmitter();
  numeros: any[] = [];
  checksValues: any[] = [];
  selected = false;
  valor: any = 0;
  valorInput: any;

  constructor(private controlsService: DynamicControlsService,
              private common: Common,
              private ionicApp: IonApp) {
                console.log('Dynamic Form Components');
  }

  ngOnInit() {
    this.form = this.controlsService.toFormGroup(this.form, this.controls);
  }

  ngOnDestroy(): void {
    // let activePortal = this.ionicApp._overlayPortal.getActive();
    // if (activePortal) {
    //   activePortal.dismiss();
    // }
  }

  isNumberOrDot(str: string): boolean {
    return str.split('').every((character: string): boolean => {
      // tslint:disable-next-line:radix
      return !isNaN(parseInt(character)) || character.includes('.');
    });
  }

  closeAndSave(val) {
    console.log('No implementado no es posible encontrar método close en ionSelect');
    // this.select.close();
  }


  ionBlur(control?) {
    if (!this.isNumberOrDot(control.value)) {
      this.common.appToast({ mensaje: `Número inválido`, posicion: 'bottom', duration: 2000 });
      control.value = '';
    }
    else {
      if (control.value.includes('.') || control.value.includes('-') || control.value.includes(',')) {
        if (control.value.length > 5) {
          control.value = control.value.substr(0, 5);
        }
      }
      if (control.value > control.max && control.value !== '') {
        control.value = '';
        this.common.appToast({ mensaje: `La respuesta debe ser menor o igual a ${control.max}`, posicion: 'bottom', duration: 2000 });
      }
      else {
        if (control.value < control.min && control.value !== '') {
          control.value = '';
          this.common.appToast({ mensaje: `La respuesta debe ser mayor o igual a ${control.min}`, posicion: 'bottom', duration: 2000 });
        }
      }
    }
  }

  addCheckbox(check: any, option: any, control: any) {
    if (this.checksValues.length > 0) {
      this.checksValues.forEach(element => {
        const resultado = this.checksValues.find(x => x.key === option.key);
        if (resultado) {
          if (resultado.key === element.key) {
            element.value = check.value;
            element.key = option.key;
            element.idPregunta = control.key;
          }
        }
        else {
          this.checksValues.push({ key: option.key, value: check.value, idPregunta: control.key });
        }
      });
    }
    else {
      if (this.checksValues.length === 0) {
        this.checksValues.push({ key: option.key, value: check.value, idPregunta: control.key });
      }
    }
    for (const prop in this.form.value) {
      if (prop === control.key) {
        this.form.value[prop] = this.checksValues;
      }
    }
  }

  onSubmit() {
    this.eSubmit.next(this.form.value);
  }
  open(control: any) {
    control.selected = !control.selected;
    this.selected = !this.selected;
  }
  close(control: any) {
    control.selected = false;
    this.selected = false;
  }

}
