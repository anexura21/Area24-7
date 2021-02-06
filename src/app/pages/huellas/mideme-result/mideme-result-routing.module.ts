import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MidemeResultPage } from './mideme-result.page';

const routes: Routes = [
  {
    path: '',
    component: MidemeResultPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MidemeResultPageRoutingModule {}
