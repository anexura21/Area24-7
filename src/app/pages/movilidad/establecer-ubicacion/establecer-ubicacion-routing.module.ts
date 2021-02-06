import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EstablecerUbicacionPage } from './establecer-ubicacion.page';

const routes: Routes = [
  {
    path: '',
    component: EstablecerUbicacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EstablecerUbicacionPageRoutingModule {}
