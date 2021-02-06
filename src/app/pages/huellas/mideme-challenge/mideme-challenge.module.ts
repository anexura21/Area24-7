import { ComponentsModule } from './../../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MidemeChallengePageRoutingModule } from './mideme-challenge-routing.module';

import { MidemeChallengePage } from './mideme-challenge.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MidemeChallengePageRoutingModule,
    ComponentsModule
  ],
  declarations: [MidemeChallengePage]
})
export class MidemeChallengePageModule {}
