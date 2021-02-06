import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VistaViajesPage } from './vista-viajes.page';

const routes: Routes = [
  {
    path: '',
    component: VistaViajesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VistaViajesPageRoutingModule {}
