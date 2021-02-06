import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'barra-navegabilidad',
  templateUrl: './barra-navegabilidad.component.html',
  styleUrls: ['./barra-navegabilidad.component.scss'],
})
export class BarraNavegabilidadComponent implements OnInit {

  @Input() titulo: string;
  @Input() showSideMenu ?: boolean;
  @Input() color ?: string;

  public currentApp: {};

  constructor() {
    if (!this.color){
      this.color =  '#0060B6';
    }
  }

  ngOnInit() {
    if (this.showSideMenu === undefined){
      this.showSideMenu = true;
    }
  }

}
