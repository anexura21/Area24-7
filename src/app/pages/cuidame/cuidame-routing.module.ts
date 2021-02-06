import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CuidamePage } from './cuidame.page';

const routes: Routes = [
  {
    path: '',
    component: CuidamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CuidamePageRoutingModule {}
