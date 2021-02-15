import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { ReportarAvistamientoPageRoutingModule } from "./reportar-avistamiento-routing.module";

import { ReportarAvistamientoPage } from "./reportar-avistamiento.page";
import { EspecieSugeridaComponent } from "./especie-sugerida/especie-sugerida.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportarAvistamientoPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [ReportarAvistamientoPage, EspecieSugeridaComponent],
})
export class ReportarAvistamientoPageModule {}
