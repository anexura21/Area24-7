import { PipesModule } from './../../../pipes/pipes.module';
import { ComponentsModule } from './../../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleViajePageRoutingModule } from './detalle-viaje-routing.module';

import { DetalleViajePage } from './detalle-viaje.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleViajePageRoutingModule,
    PipesModule
  ],
  declarations: [DetalleViajePage]
})
export class DetalleViajePageModule {}