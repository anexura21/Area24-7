import { ComponentsModule } from './../../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LineasYRutasMapaPageRoutingModule } from './lineas-y-rutas-mapa-routing.module';

import { LineasYRutasMapaPage } from './lineas-y-rutas-mapa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LineasYRutasMapaPageRoutingModule,
    ComponentsModule
  ],
  declarations: [LineasYRutasMapaPage]
})
export class LineasYRutasMapaPageModule {}
