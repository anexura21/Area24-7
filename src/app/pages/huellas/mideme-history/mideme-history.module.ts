import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MidemeHistoryPageRoutingModule } from './mideme-history-routing.module';

import { MidemeHistoryPage } from './mideme-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MidemeHistoryPageRoutingModule
  ],
  declarations: [MidemeHistoryPage]
})
export class MidemeHistoryPageModule {}
