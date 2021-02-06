import { ControlBase } from './control-base';

export class NumberControl extends ControlBase<string> {
    controlType = 'number';
    type: string;
    placeholder: string;
    min: number;
    max: number;


    constructor(options: any = {}) {
        super(options);
        this.placeholder = options.placeholder;
        this.min = options.start;
        this.max = options.end;
        this.type = options['type'] || '';
    }
}
