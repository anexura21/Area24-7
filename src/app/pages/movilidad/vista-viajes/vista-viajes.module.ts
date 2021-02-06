import { EstablecerUbicacionPageModule } from './../establecer-ubicacion/establecer-ubicacion.module';
import { ComponentsModule } from './../../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VistaViajesPageRoutingModule } from './vista-viajes-routing.module';

import { VistaViajesPage } from './vista-viajes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VistaViajesPageRoutingModule,
    ComponentsModule,
    EstablecerUbicacionPageModule
  ],
  declarations: [VistaViajesPage]
})
export class VistaViajesPageModule {}
