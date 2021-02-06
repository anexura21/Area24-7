import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MidemeCurrentChallengePage } from './mideme-current-challenge.page';

const routes: Routes = [
  {
    path: '',
    component: MidemeCurrentChallengePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MidemeCurrentChallengePageRoutingModule {}
