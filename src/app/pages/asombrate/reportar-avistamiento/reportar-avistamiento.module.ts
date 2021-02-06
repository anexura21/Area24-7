import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportarAvistamientoPageRoutingModule } from './reportar-avistamiento-routing.module';

import { ReportarAvistamientoPage } from './reportar-avistamiento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportarAvistamientoPageRoutingModule
  ],
  declarations: [ReportarAvistamientoPage]
})
export class ReportarAvistamientoPageModule {}
