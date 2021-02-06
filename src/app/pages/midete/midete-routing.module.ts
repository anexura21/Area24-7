import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MidetePage } from './midete.page';

const routes: Routes = [
  {
    path: '',
    component: MidetePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MidetePageRoutingModule {}
