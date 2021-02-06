import { ComponentsModule } from './../../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MidemeCalculatorPageRoutingModule } from './mideme-calculator-routing.module';

import { MidemeCalculatorPage } from './mideme-calculator.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MidemeCalculatorPageRoutingModule,
    ComponentsModule,
    // FormBuilder,
    // ReactiveFormsModule
  ],
  declarations: [MidemeCalculatorPage]
})
export class MidemeCalculatorPageModule {}
