import { ComponentsModule } from './../../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LineasYRutasDetallePageRoutingModule } from './lineas-y-rutas-detalle-routing.module';

import { LineasYRutasDetallePage } from './lineas-y-rutas-detalle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LineasYRutasDetallePageRoutingModule,
    ComponentsModule
  ],
  declarations: [LineasYRutasDetallePage]
})
export class LineasYRutasDetallePageModule {}
