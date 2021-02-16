import { Component, EventEmitter, Input, Output } from "@angular/core";
import { EspecieSugeridaIA } from "src/app/entities/especieSugeridaIA";

@Component({
  selector: "app-especie-sugerida",
  templateUrl: "./especie-sugerida.component.html",
  styleUrls: ["./especie-sugerida.component.scss"],
})
export class EspecieSugeridaComponent {
  @Input() especieSugeridaIA: EspecieSugeridaIA;
  @Output() especieSeleccionada: EventEmitter<EspecieSugeridaIA> = new EventEmitter();

  constructor() {}

  seleccionar(especieSeleccionada) {
    this.especieSeleccionada.emit(especieSeleccionada);
  }
}
