import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MuevetePage } from './muevete.page';

const routes: Routes = [
  {
    path: '',
    component: MuevetePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MuevetePageRoutingModule {}
