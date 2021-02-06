import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(value: string, first?: boolean): string {
    let text;

    while (value.charAt(0) === ' '){
        value = value.substring(1);
    }

    while (value.charAt(value.length - 1) === ' '){
        value = value.substring(0, value.length - 1);
    }

    if (!first) {
        value = value.toLocaleLowerCase();
        text = value.split(' ');
        // tslint:disable-next-line:forin
        for (const i in text) {
            text[i] = text[i][0].toLocaleUpperCase() + text[i].substr(1);
        }
        text = text.join(' ');
    } else {
        text = value.charAt(0).toLocaleUpperCase() + value.substr(1);
    }
    return text;
}

}
