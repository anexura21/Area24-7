import { GooglemapsService } from './../../providers/googlemaps.service';
import { Directive, ElementRef, Renderer2, OnDestroy, AfterContentInit, Input } from '@angular/core';

@Directive({
  selector: '[mapa]'
})
export class MapaDirective implements OnDestroy, AfterContentInit {

  padreDOMMapa: any;
  mapaDOM: any;
  @Input() mapa: boolean;

  constructor(public el: ElementRef,
              public renderer: Renderer2,
              public googleMaps: GooglemapsService,
  ) {
     this.mapaDOM = document.getElementById('map');
  }

  ngAfterContentInit() {

    this.padreDOMMapa = this.mapaDOM.parentNode;
    this.el
    .nativeElement
    .childNodes[0] // div.scroll-content
    .appendChild(this.mapaDOM);
    // this.el.nativeElement.innerText = this.mapaDOM;
  }

  ngOnDestroy() {
    // se clona el mapa y se coloca en el lugar donde esta el original.
    this.padreDOMMapa.appendChild(this.mapaDOM);

  }

}
