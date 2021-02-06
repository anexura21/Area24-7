import { ControlBase } from './control-base';
import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';

export class SelectControl extends ControlBase<string> {
  controlType = 'select';
  type: string;
  placeholder: any;
  options: { key: string, value: string }[] = [];
  numeros: any[] = [];
  constructor(options: any = {}) {
    super(options);
    if (options.type === 'Booleana'){
    this.placeholder = 'Si';
    }
    if (options.type === 'Numero' || options.type === 'Número'){
    this.options = this.numeros;
    this.placeholder = options.placeholder;
    }
    else{
    this.options = options['options'] || [];
    }

    for (options.start; options.start <= options.end; options.start += options.steps) {
      this.numeros.push({
        key: options.start,
        label: options.start
      });
    }
  }
}