import { ComponentsModule } from './../../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MidemeOptionsPageRoutingModule } from './mideme-options-routing.module';

import { MidemeOptionsPage } from './mideme-options.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MidemeOptionsPageRoutingModule,
    ComponentsModule
  ],
  declarations: [MidemeOptionsPage]
})
export class MidemeOptionsPageModule {}
