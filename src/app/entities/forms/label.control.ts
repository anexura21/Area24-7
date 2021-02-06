import { ControlBase } from './control-base';

export class LabelControl extends ControlBase<string> {
  controlType = 'label';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}
