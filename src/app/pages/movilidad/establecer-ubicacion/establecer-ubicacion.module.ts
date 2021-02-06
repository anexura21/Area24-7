import { ComponentsModule } from './../../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EstablecerUbicacionPageRoutingModule } from './establecer-ubicacion-routing.module';

import { EstablecerUbicacionPage } from './establecer-ubicacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EstablecerUbicacionPageRoutingModule,
    ComponentsModule
  ],
  declarations: [EstablecerUbicacionPage]
})
export class EstablecerUbicacionPageModule {}
