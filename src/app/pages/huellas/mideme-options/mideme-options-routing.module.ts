import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MidemeOptionsPage } from './mideme-options.page';

const routes: Routes = [
  {
    path: '',
    component: MidemeOptionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MidemeOptionsPageRoutingModule {}
