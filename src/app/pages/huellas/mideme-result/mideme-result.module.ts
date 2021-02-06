import { ComponentsModule } from './../../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MidemeResultPageRoutingModule } from './mideme-result-routing.module';

import { MidemeResultPage } from './mideme-result.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MidemeResultPageRoutingModule,
    ComponentsModule
  ],
  declarations: [MidemeResultPage]
})
export class MidemeResultPageModule {}
