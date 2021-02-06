import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MidetePageRoutingModule } from './midete-routing.module';

import { MidetePage } from './midete.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MidetePageRoutingModule
  ],
  declarations: [MidetePage]
})
export class MidetePageModule {}
