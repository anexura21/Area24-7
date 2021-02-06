import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportarAvistamientoPage } from './reportar-avistamiento.page';

const routes: Routes = [
  {
    path: '',
    component: ReportarAvistamientoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportarAvistamientoPageRoutingModule {}
