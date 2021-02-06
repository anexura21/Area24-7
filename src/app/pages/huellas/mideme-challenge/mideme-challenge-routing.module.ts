import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MidemeChallengePage } from './mideme-challenge.page';

const routes: Routes = [
  {
    path: '',
    component: MidemeChallengePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MidemeChallengePageRoutingModule {}
