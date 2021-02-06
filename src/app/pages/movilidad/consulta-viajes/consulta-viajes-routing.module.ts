import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsultaViajesPage } from './consulta-viajes.page';

const routes: Routes = [
  {
    path: '',
    component: ConsultaViajesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultaViajesPageRoutingModule {}
