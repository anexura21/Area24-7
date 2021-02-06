import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CuidamePageRoutingModule } from './cuidame-routing.module';

import { CuidamePage } from './cuidame.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CuidamePageRoutingModule
  ],
  declarations: [CuidamePage]
})
export class CuidamePageModule {}
