import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SiataPage } from './siata.page';

const routes: Routes = [
  {
    path: '',
    component: SiataPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SiataPageRoutingModule {}
