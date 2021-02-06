import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SiataPageRoutingModule } from './siata-routing.module';

import { SiataPage } from './siata.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SiataPageRoutingModule
  ],
  declarations: [SiataPage]
})
export class SiataPageModule {}
