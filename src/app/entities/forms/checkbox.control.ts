import { ControlBase } from './control-base';

export class CheckboxControl extends ControlBase<string> {
  controlType = 'checkbox';
  type: string;
  options: { key: string, value: string, idPregunta: number}[] = [];

  constructor(options: {} = {}) {
    super(options);
    this.options = options['options'] || [];
  }
}
