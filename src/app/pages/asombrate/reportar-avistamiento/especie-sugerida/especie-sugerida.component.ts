import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Especie } from "src/app/entities/especie";

@Component({
  selector: "app-especie-sugerida",
  templateUrl: "./especie-sugerida.component.html",
  styleUrls: ["./especie-sugerida.component.scss"],
})
export class EspecieSugeridaComponent {
  @Input() especie: Especie;
  @Output() especieSeleccionada: EventEmitter<Especie> = new EventEmitter();

  constructor() {}

  seleccionar(especieSeleccionada) {
    this.especieSeleccionada.emit(especieSeleccionada);
  }
}
