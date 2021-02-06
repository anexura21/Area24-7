import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CuidameCreatePage } from './cuidame-create.page';

const routes: Routes = [
  {
    path: '',
    component: CuidameCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CuidameCreatePageRoutingModule {}
