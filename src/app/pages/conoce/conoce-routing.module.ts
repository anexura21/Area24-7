import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConocePage } from './conoce.page';

const routes: Routes = [
  {
    path: '',
    component: ConocePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConocePageRoutingModule {}
