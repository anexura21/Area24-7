import { ControlBase } from './control-base';

export class DatatimeControl extends ControlBase<string> {
  controlType = 'datatime';
  type: string;

  constructor(options: any = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}
