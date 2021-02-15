import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EnciclaPage } from './encicla.page';

const routes: Routes = [
  {
    path: '',
    component: EnciclaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnciclaPageRoutingModule {}
