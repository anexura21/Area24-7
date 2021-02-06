import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AsombratePage } from './asombrate.page';

const routes: Routes = [
  {
    path: '',
    component: AsombratePage
  },  {
    path: 'reportar-avistamiento',
    loadChildren: () => import('./reportar-avistamiento/reportar-avistamiento.module').then( m => m.ReportarAvistamientoPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsombratePageRoutingModule {}
