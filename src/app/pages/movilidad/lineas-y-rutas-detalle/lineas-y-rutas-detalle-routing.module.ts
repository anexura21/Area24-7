import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LineasYRutasDetallePage } from './lineas-y-rutas-detalle.page';

const routes: Routes = [
  {
    path: '',
    component: LineasYRutasDetallePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LineasYRutasDetallePageRoutingModule {}
