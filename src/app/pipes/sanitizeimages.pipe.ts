import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sanitizeimages'
})
export class SanitizeimagesPipe implements PipeTransform {

  constructor(
    private domSanitizer: DomSanitizer
  ) {

  }

  transform( url: string): any {
    return this.domSanitizer.bypassSecurityTrustResourceUrl( url );
  }

}
