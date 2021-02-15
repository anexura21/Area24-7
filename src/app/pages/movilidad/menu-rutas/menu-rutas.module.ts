import { ContenidoMapaDirective } from '../../../directives/movilidad/contenido-mapa.directive';
import { MapaDirective } from '../../../directives/movilidad/mapa.directive';
import { ComponentsModule } from '../../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuRutasPageRoutingModule } from './menu-rutas-routing.module';

import { MenuRutasPage } from './menu-rutas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuRutasPageRoutingModule,
    ComponentsModule
  ],
  declarations: [MenuRutasPage]
})
export class MenuRutasPageModule {}
