import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConocePageRoutingModule } from './conoce-routing.module';

import { ConocePage } from './conoce.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConocePageRoutingModule
  ],
  declarations: [ConocePage]
})
export class ConocePageModule {}
