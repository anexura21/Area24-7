import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DecisionTreeVigiaPageRoutingModule } from './decision-tree-vigia-routing.module';

import { DecisionTreeVigiaPage } from './decision-tree-vigia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DecisionTreeVigiaPageRoutingModule
  ],
  declarations: [DecisionTreeVigiaPage]
})
export class DecisionTreeVigiaPageModule {}
