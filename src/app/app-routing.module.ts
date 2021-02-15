import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {GeneralConfigurationComponent} from './components/general-configuration/general-configuration.component';

const routes: Routes = [
    {
        path: 'inicio',
        loadChildren: () => import('./pages/inicio/inicio.module').then(m => m.InicioPageModule)
    },
    {
      path: '',
      redirectTo: 'login',
      pathMatch: 'full'
    },
    {
        path: 'side-menu',
        loadChildren: () => import('./pages/side-menu/side-menu.module').then(m => m.SideMenuPageModule)
    },
    {
        path: 'modal',
        loadChildren: () => import('./pages/modal/modal.module').then(m => m.ModalPageModule)
    },
    {
        path: 'consulta-viajes',
        loadChildren: () => import('./pages/movilidad/consulta-viajes/consulta-viajes.module').then(m => m.ConsultaViajesPageModule)
    },
    {
        path: 'vista-viajes',
        loadChildren: () => import('./pages/movilidad/vista-viajes/vista-viajes.module').then(m => m.VistaViajesPageModule)
    },
    {
        path: 'comment',
        loadChildren: () => import('./pages/vigia/comment/comment.module').then(m => m.CommentPageModule)
    },
    // {
    //   path: 'cuidame-create',
    //   loadChildren: () => import('./pages/vigia/cuidame-create/cuidame-create.module').then( m => m.CuidameCreatePageModule)
    // },
    {
        path: 'decision-tree-vigia',
        loadChildren: () => import('./pages/vigia/decision-tree-vigia/decision-tree-vigia.module').then(m => m.DecisionTreeVigiaPageModule)
    },
    {
        path: 'mideme-options',
        loadChildren: () => import('./pages/huellas/mideme-options/mideme-options.module').then(m => m.MidemeOptionsPageModule)
    },
    {
        path: 'mideme-calculator',
        loadChildren: () => import('./pages/huellas/mideme-calculator/mideme-calculator.module').then(m => m.MidemeCalculatorPageModule)
    },
    {
        path: 'mideme-result',
        loadChildren: () => import('./pages/huellas/mideme-result/mideme-result.module').then(m => m.MidemeResultPageModule)
    },
    {
        path: 'encuesta',
        loadChildren: () => import('./pages/encuesta/encuesta.module').then(m => m.EncuestaPageModule)
    },
    {
        path: 'mideme-history',
        loadChildren: () => import('./pages/huellas/mideme-history/mideme-history.module').then(m => m.MidemeHistoryPageModule)
    },
    {
        path: 'mideme-challenge',
        loadChildren: () => import('./pages/huellas/mideme-challenge/mideme-challenge.module').then(m => m.MidemeChallengePageModule)
    },
    {
        path: 'establecer-ubicacion',
        loadChildren: () => import('./pages/movilidad/establecer-ubicacion/establecer-ubicacion.module')
            .then(m => m.EstablecerUbicacionPageModule)
    },
    {
        path: 'ubicacion-favorita',
        loadChildren: () => import('./pages/ubicacion-favorita/ubicacion-favorita.module')
            .then(m => m.UbicacionFavoritaPageModule)
    },
    {
        path: 'detalle-viaje',
        loadChildren: () => import('./pages/movilidad/detalle-viaje/detalle-viaje.module').then(m => m.DetalleViajePageModule)
    },
    {
        path: 'muevete',
        loadChildren: () => import('./pages/muevete/muevete.module').then(m => m.MuevetePageModule)
    },
    {
        path: 'asombrate',
        loadChildren: () => import('./pages/asombrate/asombrate.module').then(m => m.AsombratePageModule)
    },
    {
        path: 'conoce',
        loadChildren: () => import('./pages/conoce/conoce.module').then(m => m.ConocePageModule)
    },
    {
        path: 'siata',
        loadChildren: () => import('./pages/siata/siata.module').then(m => m.SiataPageModule)
    },
    {
        path: 'cuidame',
        loadChildren: () => import('./pages/cuidame/cuidame.module').then(m => m.CuidamePageModule)
    },
    {
        path: 'midete',
        loadChildren: () => import('./pages/midete/midete.module').then(m => m.MidetePageModule)
    },
    {
        path: 'login',
        loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
    },
    {
        path: 'configuracion',
        component: GeneralConfigurationComponent
    },
    {
        path: 'perfil-usuario',
        loadChildren: () => import('./pages/perfil-usuario/perfil-usuario.module').then(m => m.PerfilUsuarioPageModule)
    },
    {
        path: 'usuario',
        loadChildren: () => import('./pages/usuario/usuario.module').then(m => m.UsuarioPageModule)
    },
  {
    path: 'menu-rutas',
    loadChildren: () => import('./pages/movilidad/menu-rutas/menu-rutas.module').then( m => m.MenuRutasPageModule)
  },
  {
    path: 'lineas-y-rutas-mapa',
    loadChildren: () => import('./pages/movilidad/lineas-y-rutas-mapa/lineas-y-rutas-mapa.module').then( m => m.LineasYRutasMapaPageModule)
  },
  {
    path: 'lineas-y-rutas-detalle',
    loadChildren: () =>
        import('./pages/movilidad/lineas-y-rutas-detalle/lineas-y-rutas-detalle.module').then( m => m.LineasYRutasDetallePageModule)
  },  {
    path: 'encicla',
    loadChildren: () => import('./pages/movilidad/encicla/encicla.module').then( m => m.EnciclaPageModule)
  }





];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
