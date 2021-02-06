import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UbicacionFavoritaPageRoutingModule } from './ubicacion-favorita-routing.module';

import { UbicacionFavoritaPage } from './ubicacion-favorita.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UbicacionFavoritaPageRoutingModule,
    ComponentsModule
  ],
  declarations: [UbicacionFavoritaPage]
})
export class UbicacionFavoritaPageModule {}
