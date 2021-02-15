import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuRutasPage } from './menu-rutas.page';

const routes: Routes = [
  {
    path: '',
    component: MenuRutasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuRutasPageRoutingModule {}
