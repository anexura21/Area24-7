import { ComponentsModule } from './../../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsultaViajesPageRoutingModule } from './consulta-viajes-routing.module';

import { ConsultaViajesPage } from './consulta-viajes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsultaViajesPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ConsultaViajesPage ]
})
export class ConsultaViajesPageModule {}
