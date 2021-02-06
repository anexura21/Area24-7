import { ComponentsModule } from './../../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MidemeCurrentChallengePageRoutingModule } from './mideme-current-challenge-routing.module';

import { MidemeCurrentChallengePage } from './mideme-current-challenge.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MidemeCurrentChallengePageRoutingModule,
    ComponentsModule
  ],
  declarations: [MidemeCurrentChallengePage]
})
export class MidemeCurrentChallengePageModule {}
