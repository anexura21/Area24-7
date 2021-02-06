import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CuidameCreatePageRoutingModule } from './cuidame-create-routing.module';

import { CuidameCreatePage } from './cuidame-create.page';
import { ComponentsModule } from './../../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    CuidameCreatePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [CuidameCreatePage]
})
export class CuidameCreatePageModule {}
