import { GooglemapsService } from './../../providers/googlemaps.service';
import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[contenido-mapa]'
})
export class ContenidoMapaDirective {

  constructor(public el: ElementRef,
              public renderer: Renderer2,
              public googleMaps: GooglemapsService,
  ) {
    // style="position: absolute; z-index:999; width: 100%;"
    renderer.setStyle(el.nativeElement, 'position', 'fixed');
    renderer.setStyle(el.nativeElement, 'z-index', '999');
    renderer.setStyle(el.nativeElement, 'width', '100%');
  }

}
