import { FormControl } from '@angular/forms';
import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[only-numbers]'
})
export class OnlyNumbersDirective {

  constructor(private el: ElementRef) { }

    @Input('only-numbers')
    private valueFormCtrl: FormControl;


    @HostListener('keyup', ['$event'])
    onKeyUp(event) {

        if (!this.isNumber(this.valueFormCtrl.value)) {
            const strLength: number = this.valueFormCtrl.value.length;
            const newValue: string = this.valueFormCtrl.value.substr(0, strLength - 1);
            this.valueFormCtrl.value.setValue(newValue);
        }
    }

    isNumber(str: string): boolean {
        return str.split('').every((character: string): boolean => {
            return !isNaN(parseInt(character, 0));
        });
    }

}
