import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DecisionTreeVigiaPage } from './decision-tree-vigia.page';

const routes: Routes = [
  {
    path: '',
    component: DecisionTreeVigiaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DecisionTreeVigiaPageRoutingModule {}
