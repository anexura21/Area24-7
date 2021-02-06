import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ControlBase } from '../../entities/forms/control-base';

@Injectable({
  providedIn: 'root'
})
export class DynamicControlsService {

  constructor(private fb: FormBuilder) { }

  toFormGroup(formGroup: FormGroup, controls: ControlBase<any>[]) {
    formGroup = formGroup || new FormGroup({});
    controls.forEach((control: any) => {
      if (control.controlType === 'select'){
        console.log('el control', control);
        if (control.numeros[0].label == null){
          control.placeholder = 'Sí';
        }
        else{
          control.placeholder = control.numeros[0].label;
        }
      }
      if (control.controlType === 'checkbox'){
        control.options.forEach(element => {
          const formControl = control.required
          ? new FormControl(element.value || '', Validators.required)
          : new FormControl(element.value || '');
          formGroup.addControl(element.key, formControl);
        });
      }
      else{
        const formControl = control.required
          ? new FormControl(control.value || '', Validators.required)
          : new FormControl(control.value || '');
        formGroup.addControl(control.key, formControl);
      }
    });

    return formGroup;
  }

}
